
#!/usr/bin/env python3
"""
Final MIDI Integration Validator
Ensures all MIDI files in the system are properly integrated and cataloged
"""

import os
import json
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinalMidiValidator:
    def __init__(self):
        self.system_midi_files = []
        self.integrated_files = []
        self.missing_files = []
        self.validation_report = {
            'total_system_files': 0,
            'total_integrated_files': 0,
            'missing_integrations': [],
            'integration_status': 'pending'
        }
    
    def scan_system_midi_files(self):
        """Scan entire system for MIDI files"""
        logger.info("🔍 Scanning system for all MIDI files...")
        
        # Exclude integrated storage directories from the scan
        exclude_dirs = {'storage/midi/templates', 'storage/midi/groove', 'storage/midi/generated'}
        
        search_paths = [
            Path("attached_assets"),
            Path("mir-data"), 
            Path("assets"),
            Path("temp-dreamsound-repo"),
            Path("uploads"),
            Path("music Gen extra"),
            Path("storage/midi/groove-dataset")  # Include original dataset
        ]
        
        midi_extensions = ['.mid', '.midi', '.MID', '.MIDI']
        
        for search_path in search_paths:
            if search_path.exists():
                for ext in midi_extensions:
                    for midi_file in search_path.rglob(f"*{ext}"):
                        if midi_file.is_file() and midi_file.stat().st_size > 0:
                            # Skip if it's already in an integrated directory
                            if not any(exclude_dir in str(midi_file) for exclude_dir in exclude_dirs):
                                self.system_midi_files.append(midi_file)
        
        self.validation_report['total_system_files'] = len(self.system_midi_files)
        logger.info(f"📊 Found {len(self.system_midi_files)} unintegrated MIDI files")
    
    def scan_integrated_files(self):
        """Scan integrated directories"""
        logger.info("📁 Scanning integrated MIDI files...")
        
        integrated_dirs = [
            Path("storage/midi/templates"),
            Path("storage/midi/groove"),
            Path("storage/midi/generated")
        ]
        
        for integrated_dir in integrated_dirs:
            if integrated_dir.exists():
                for midi_file in integrated_dir.rglob("*.mid"):
                    if midi_file.is_file():
                        self.integrated_files.append(midi_file)
        
        self.validation_report['total_integrated_files'] = len(self.integrated_files)
        logger.info(f"📊 Found {len(self.integrated_files)} integrated MIDI files")
    
    def validate_integration(self):
        """Check which files still need integration"""
        logger.info("🔄 Validating integration status...")
        
        self.scan_system_midi_files()
        self.scan_integrated_files()
        
        # Files that still need integration
        for midi_file in self.system_midi_files:
            needs_integration = True
            
            # Check if this file has already been integrated
            for integrated_file in self.integrated_files:
                if midi_file.stem in integrated_file.name:
                    needs_integration = False
                    break
            
            if needs_integration:
                self.missing_files.append({
                    'path': str(midi_file),
                    'size': midi_file.stat().st_size,
                    'name': midi_file.name
                })
        
        self.validation_report['missing_integrations'] = self.missing_files
        
        if len(self.missing_files) == 0:
            self.validation_report['integration_status'] = 'complete'
            logger.info("✅ All MIDI files have been integrated!")
        else:
            self.validation_report['integration_status'] = 'incomplete'
            logger.info(f"⚠️  {len(self.missing_files)} files still need integration")
        
        # Save validation report
        self._save_validation_report()
    
    def _save_validation_report(self):
        """Save validation report"""
        report_path = Path("storage/midi/final_validation_report.json")
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(self.validation_report, f, indent=2, default=str)
        
        logger.info(f"📊 Validation report saved: {report_path}")
    
    def generate_summary(self):
        """Generate integration summary"""
        print("\n" + "="*60)
        print("FINAL MIDI INTEGRATION VALIDATION SUMMARY")
        print("="*60)
        print(f"📊 Total System MIDI Files: {self.validation_report['total_system_files']}")
        print(f"📁 Total Integrated Files: {self.validation_report['total_integrated_files']}")
        print(f"⚠️  Files Needing Integration: {len(self.missing_files)}")
        print(f"🎯 Integration Status: {self.validation_report['integration_status'].upper()}")
        
        if self.missing_files:
            print(f"\n📝 Files Still Needing Integration:")
            for i, file_info in enumerate(self.missing_files, 1):
                print(f"   {i}. {file_info['name']} ({file_info['size']} bytes)")
        
        print("\n" + "="*60)

def main():
    validator = FinalMidiValidator()
    validator.validate_integration()
    validator.generate_summary()

if __name__ == "__main__":
    main()
