
#!/usr/bin/env python3
"""
Find and analyze small files (0-10 bytes) to identify junk files
"""

import os
import json
from pathlib import Path

def find_small_files():
    """Find files with 0-10 bytes and categorize them"""
    
    small_files = []
    junk_files = []
    necessary_files = []
    
    # Directories to skip (large directories that don't need scanning)
    skip_dirs = {
        '.git', 'node_modules', '__pycache__', '.cache', '.pythonlibs',
        'Retrieval-based-Voice-Conversion-WebUI', 'attached_assets'
    }
    
    # Known necessary small files patterns
    necessary_patterns = {
        '.gitkeep', '.gitignore', '__init__.py', '.env', 'Icon'
    }
    
    # Known junk file patterns
    junk_patterns = {
        '.DS_Store', 'Thumbs.db', 'desktop.ini', '.Trashes'
    }
    
    print("🔍 Scanning for files with 0-10 bytes...")
    
    for root, dirs, files in os.walk('.'):
        # Skip certain directories
        dirs[:] = [d for d in dirs if d not in skip_dirs]
        
        for file in files:
            file_path = os.path.join(root, file)
            try:
                file_size = os.path.getsize(file_path)
                
                if 0 <= file_size <= 10:
                    file_info = {
                        'path': file_path,
                        'size': file_size,
                        'name': file
                    }
                    
                    small_files.append(file_info)
                    
                    # Categorize file
                    is_necessary = any(pattern in file for pattern in necessary_patterns)
                    is_junk = any(pattern in file for pattern in junk_patterns)
                    
                    # Special cases
                    if file == 'Icon' and file_size == 0:
                        # Empty Icon files are macOS junk
                        junk_files.append(file_info)
                    elif file.startswith('.') and file_size == 0 and not is_necessary:
                        # Hidden empty files (often junk)
                        junk_files.append(file_info)
                    elif is_junk:
                        junk_files.append(file_info)
                    elif is_necessary:
                        necessary_files.append(file_info)
                    elif file_size == 0 and file.endswith(('.txt', '.md', '.log')):
                        # Empty text files might be junk
                        junk_files.append(file_info)
                    else:
                        # Uncertain - needs manual review
                        print(f"📋 Manual review needed: {file_path} ({file_size} bytes)")
                        
            except (OSError, IOError) as e:
                print(f"❌ Error accessing {file_path}: {e}")
    
    # Display results
    print(f"\n📊 Found {len(small_files)} small files (0-10 bytes)")
    print(f"🗑️  Identified {len(junk_files)} junk files")
    print(f"✅ Identified {len(necessary_files)} necessary files")
    
    if junk_files:
        print("\n🗑️  JUNK FILES TO REMOVE:")
        for file_info in junk_files:
            print(f"   - {file_info['path']} ({file_info['size']} bytes)")
    
    if necessary_files:
        print("\n✅ NECESSARY FILES (keeping):")
        for file_info in necessary_files:
            print(f"   - {file_info['path']} ({file_info['size']} bytes)")
    
    # Save analysis report
    report = {
        'total_small_files': len(small_files),
        'junk_files_count': len(junk_files),
        'necessary_files_count': len(necessary_files),
        'junk_files': junk_files,
        'necessary_files': necessary_files,
        'all_small_files': small_files
    }
    
    with open('storage/small_files_analysis.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    # Remove junk files
    if junk_files:
        print(f"\n🗑️  Removing {len(junk_files)} junk files...")
        removed_count = 0
        
        for file_info in junk_files:
            try:
                os.remove(file_info['path'])
                print(f"   ✅ Removed: {file_info['path']}")
                removed_count += 1
            except Exception as e:
                print(f"   ❌ Failed to remove {file_info['path']}: {e}")
        
        print(f"\n🎉 Successfully removed {removed_count}/{len(junk_files)} junk files")
    else:
        print("\n✨ No junk files found to remove!")
    
    return report

if __name__ == "__main__":
    find_small_files()
