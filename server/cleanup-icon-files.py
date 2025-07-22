
#!/usr/bin/env python3
"""
Clean up empty Icon files from MIDI directories
"""

import os
import json
from pathlib import Path

def cleanup_icon_files():
    """Remove empty Icon files from MIDI directories"""
    
    base_path = Path("storage/midi/groove-dataset")
    icon_files = []
    removed_files = []
    
    print("🔍 Scanning for Icon files...")
    
    # Find all Icon files
    for icon_file in base_path.rglob("Icon"):
        if icon_file.is_file():
            icon_files.append(icon_file)
            file_size = icon_file.stat().st_size
            print(f"Found: {icon_file} (size: {file_size} bytes)")
    
    print(f"\n📊 Found {len(icon_files)} Icon files")
    
    # Remove empty Icon files
    for icon_file in icon_files:
        try:
            file_size = icon_file.stat().st_size
            if file_size == 0:
                print(f"🗑️  Removing empty Icon file: {icon_file}")
                icon_file.unlink()
                removed_files.append(str(icon_file))
            else:
                print(f"⚠️  Icon file not empty ({file_size} bytes): {icon_file}")
        except Exception as e:
            print(f"❌ Error processing {icon_file}: {e}")
    
    # Create cleanup report
    cleanup_report = {
        "total_icon_files_found": len(icon_files),
        "empty_files_removed": len(removed_files),
        "removed_files": removed_files,
        "cleanup_timestamp": str(Path().resolve())
    }
    
    # Save report
    report_path = Path("storage/midi/icon_cleanup_report.json")
    with open(report_path, 'w') as f:
        json.dump(cleanup_report, f, indent=2)
    
    print(f"\n✅ Cleanup complete:")
    print(f"   - Files found: {len(icon_files)}")
    print(f"   - Files removed: {len(removed_files)}")
    print(f"   - Report saved: {report_path}")

if __name__ == "__main__":
    cleanup_icon_files()
