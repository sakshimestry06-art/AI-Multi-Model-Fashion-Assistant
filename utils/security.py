from pathlib import Path


def ensure_child_path(parent: Path, child: Path) -> Path:
    """Resolve a path and ensure it stays inside the expected parent directory."""

    parent_resolved = parent.resolve()
    child_resolved = child.resolve()
    if parent_resolved not in child_resolved.parents and child_resolved != parent_resolved:
        raise ValueError("Unsafe path detected.")
    return child_resolved
