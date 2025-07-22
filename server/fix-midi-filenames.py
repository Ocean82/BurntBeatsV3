
#!/usr/bin/env python3
"""
Fix MIDI Filenames for Windows Compatibility
Renames all MIDI files to be Windows-compatible by:
- Replacing spaces with underscores
- Removing problematic symbols
- Shortening long names
- Ensuring ASCII-only characters
"""

import os
import re
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MidiFilenamesFixer:
    def __init__(self):
        self.midi_directories = [
            Path("storage/midi/templates"),
            Path("storage/midi/groove"),
            Path("storage/midi/generated"),
            Path("storage/midi/groove-dataset"),
            Path("attached_assets"),
            Path("temp-dreamsound-repo")
        ]
        self.renamed_files = []
        self.errors = []

    def sanitize_filename(self, filename):
        """Sanitize filename for Windows compatibility"""
        # Get the name and extension
        name, ext = os.path.splitext(filename)
        
        # Replace spaces with underscores
        name = name.replace(' ', '_')
        
        # Remove problematic characters for Windows
        # Remove: : ? * | " < > \ / and other non-ASCII
        name = re.sub(r'[<>:"/\\|?*]', '', name)
        
        # Remove other symbols and keep only alphanumeric, underscore, hyphen
        name = re.sub(r'[^\w\-_]', '', name)
        
        # Remove multiple underscores
        name = re.sub(r'_+', '_', name)
        
        # Remove leading/trailing underscores
        name = name.strip('_')
        
        # Shorten if too long (Windows has 260 char path limit, keep names reasonable)
        if len(name) > 50:
            name = name[:50]
        
        # Ensure it's not empty
        if not name:
            name = "midi_file"
            
        return name + ext

    def rename_files_in_directory(self, directory):
        """Rename all MIDI files in a directory"""
        if not directory.exists():
            logger.info(f"Directory does not exist: {directory}")
            return
            
        logger.info(f"Processing directory: {directory}")
        
        # Find all MIDI files recursively
        midi_extensions = ['.mid', '.midi', '.MID', '.MIDI']
        midi_files = []
        
        for ext in midi_extensions:
            midi_files.extend(directory.rglob(f"*{ext}"))
        
        logger.info(f"Found {len(midi_files)} MIDI files in {directory}")
        
        for midi_file in midi_files:
            try:
                original_name = midi_file.name
                new_name = self.sanitize_filename(original_name)
                
                if original_name != new_name:
                    new_path = midi_file.parent / new_name
                    
                    # Check if target already exists
                    counter = 1
                    while new_path.exists():
                        name, ext = os.path.splitext(new_name)
                        new_name = f"{name}_{counter}{ext}"
                        new_path = midi_file.parent / new_name
                        counter += 1
                    
                    # Rename the file
                    midi_file.rename(new_path)
                    
                    self.renamed_files.append({
                        'original': str(midi_file),
                        'new': str(new_path),
                        'original_name': original_name,
                        'new_name': new_name
                    })
                    
                    logger.info(f"Renamed: {original_name} -> {new_name}")
                
            except Exception as e:
                error_msg = f"Error renaming {midi_file}: {e}"
                logger.error(error_msg)
                self.errors.append(error_msg)

    def update_catalog_files(self):
        """Update catalog files with new filenames"""
        catalog_files = [
            Path("storage/midi/groove/metadata/groove_catalog.json"),
            Path("storage/midi/templates/chord-sets/chord_sets_catalog.json"),
            Path("storage/midi/comprehensive_midi_catalog.json")
        ]
        
        for catalog_file in catalog_files:
            if catalog_file.exists():
                try:
                    import json
                    with open(catalog_file, 'r') as f:
                        data = json.load(f)
                    
                    # Update the catalog with new filenames
                    updated = False
                    for renamed in self.renamed_files:
                        old_name = renamed['original_name']
                        new_name = renamed['new_name']
                        
                        # Convert to string and replace occurrences
                        data_str = json.dumps(data)
                        if old_name in data_str:
                            data_str = data_str.replace(old_name, new_name)
                            data = json.loads(data_str)
                            updated = True
                    
                    if updated:
                        with open(catalog_file, 'w') as f:
                            json.dump(data, f, indent=2)
                        logger.info(f"Updated catalog: {catalog_file}")
                        
                except Exception as e:
                    logger.error(f"Error updating catalog {catalog_file}: {e}")

    def generate_report(self):
        """Generate a report of all renamed files"""
        report = {
            'total_renamed': len(self.renamed_files),
            'errors': len(self.errors),
            'renamed_files': self.renamed_files,
            'error_details': self.errors
        }
        
        report_path = Path("storage/midi/filename_fix_report.json")
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        import json
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved to: {report_path}")
        return report

    def fix_all_filenames(self):
        """Fix all MIDI filenames across all directories"""
        logger.info("🔧 Starting MIDI filename fixes for Windows compatibility...")
        
        for directory in self.midi_directories:
            self.rename_files_in_directory(directory)
        
        # Update catalog files
        self.update_catalog_files()
        
        # Generate report
        report = self.generate_report()
        
        logger.info(f"✅ Filename fixing complete!")
        logger.info(f"📊 Total files renamed: {report['total_renamed']}")
        logger.info(f"❌ Errors: {report['errors']}")
        
        if report['total_renamed'] > 0:
            logger.info("📝 Sample renames:")
            for i, renamed in enumerate(self.renamed_files[:5]):  # Show first 5
                logger.info(f"   {renamed['original_name']} -> {renamed['new_name']}")
            
            if len(self.renamed_files) > 5:
                logger.info(f"   ... and {len(self.renamed_files) - 5} more")

def main():
    fixer = MidiFilenamesFixer()
    fixer.fix_all_filenames()

if __name__ == "__main__":
    main()
