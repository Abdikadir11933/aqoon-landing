"""Validate navigable context, stage contracts and portable skill discovery.

Only maintained routers/skills and their entry documents are checked. Historical
evidence may contain retired URLs or paths; this does not rewrite that history.
No network or third-party packages are required. Semantic correctness and privacy
still require review of the diff and the underlying sources.
"""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def check(root: Path) -> list[str]:
    errors: list[str] = []
    canonical = root / ".claude/skills"
    discovery = root / ".agents/skills"
    skill_dirs = {p.name: p for p in canonical.iterdir() if p.is_dir()}
    discovered = {p.name: p for p in discovery.iterdir()} if discovery.is_dir() else {}
    if set(skill_dirs) != set(discovered):
        errors.append("Skill discovery differs from canonical folders: "
                      f"missing={sorted(set(skill_dirs) - set(discovered))}, "
                      f"extra={sorted(set(discovered) - set(skill_dirs))}")
    for name, folder in skill_dirs.items():
        link = discovery / name
        if not link.is_symlink() or link.resolve() != folder.resolve():
            errors.append(f".agents/skills/{name} must link to .claude/skills/{name}")

    maintained = {root / name for name in ("README.md", "AGENTS.md", "CLAUDE.md", "CONTEXT.md")}
    maintained.update(root / name for name in (
        "docs/architecture/repo-map.md", "docs/architecture/context-workflow.md",
        "docs/architecture/business-operating-model.md",
        "docs/briefs/task-handoff-template.md",
        "workspaces/evidence-and-research/references/aqoon-evidence-index.md",
        "workspaces/messaging/references/aqoon-demand-generation-and-content-os.md",
    ))
    for top in ("workspaces", "caawi", "tracker", "seo", "_core"):
        for name in ("CONTEXT.md", "CLAUDE.md", "AGENTS.md"):
            maintained.update((root / top).rglob(name))
    maintained.update(canonical.glob("*/SKILL.md"))

    for path in sorted(maintained):
        relative = path.relative_to(root)
        if not path.is_file():
            errors.append(f"Missing maintained context: {relative}")
            continue
        text = path.read_text(encoding="utf-8")
        # Markdown links, plus exact .md paths used by the existing plain router.
        targets = re.findall(r"\[[^\]\n]*\]\(([^)\s]+)\)", text)
        targets += re.findall(r"`([^`\n]+\.md)`", text)
        for target in set(targets):
            if target.startswith(("http:", "https:", "mailto:", "#")):
                continue
            if any(c in target for c in "<>*{}|") or " " in target:
                continue  # Explicit template/glob, not a concrete file target.
            local = target.split("#", 1)[0]
            if not local:
                continue
            candidates = ((path.parent / local).resolve(), (root / local.lstrip("/")).resolve())
            if not any(p.is_relative_to(root.resolve()) and p.exists() for p in candidates):
                errors.append(f"Broken context target in {relative}: {target}")
        if "stages" in path.parts and path.name == "CONTEXT.md":
            for section in ("Inputs", "Process", "Outputs"):
                if not re.search(rf"^## {section}\s*$", text, re.M):
                    errors.append(f"Stage {relative} missing {section} contract")

    inventory = subprocess.run(
        ["git", "ls-files", "-z"], cwd=root, text=True, capture_output=True, check=True
    ).stdout.split("\0")
    top_dirs = {p.split("/", 1)[0] for p in inventory if "/" in p}
    repo_map = (root / "docs/architecture/repo-map.md").read_text(encoding="utf-8")
    for top in sorted(top_dirs):
        if f"{top}/" not in repo_map:
            errors.append(f"Repository map has no owner for tracked folder: {top}/")
    for path in inventory:
        if path.startswith("_local/"):
            errors.append(f"Temporary task state must not be tracked: {path}")
    return errors


if __name__ == "__main__":
    failures = check(ROOT)
    if failures:
        print("AQOON context QA failed:\n" + "\n".join(f"- {item}" for item in failures))
        sys.exit(1)
    print("AQOON context QA passed: links, stage contracts, skill discovery and folder ownership.")
