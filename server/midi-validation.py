
#!/usr/bin/env python3
"""
MIDI Validation and Processing Script for Burnt Beats
Ensures all MIDI files are properly processed and ready to function
"""

import os
import json
import mido
from pathlib import Path
import argparse
from typing import Dict, List, Any

class MidiValidator:
    def __init__(self):
        self.midi_base = Path("./storage/midi")
        self.templates_dir = self.midi_base / "templates"
        self.generated_dir = self.midi_base / "generated"
        self.groove_dir = self.midi_base / "groove-dataset"
        
        self.validation_report = {
            "templates": {"total": 0, "valid": 0, "invalid": []},
            "generated": {"total": 0, "valid": 0, "invalid": []},
            "groove_dataset": {"total": 0, "valid": 0, "invalid": []},
            "chord_sets": {"total": 0, "valid": 0, "invalid": []},
            "catalogs": {"missing": [], "outdated": []},
            "errors": []
        }

    def validate_midi_file(self, file_path: Path) -> Dict[str, Any]:
        """Validate a single MIDI file"""
        try:
            mid = mido.MidiFile(file_path)
            
            # Basic validation
            validation = {
                "valid": True,
                "path": str(file_path),
                "type": mid.type,
                "ticks_per_beat": mid.ticks_per_beat,
                "length": mid.length,
                "num_tracks": len(mid.tracks),
                "has_notes": False,
                "tempo_changes": 0,
                "issues": []
            }
            
            # Check for actual musical content
            note_count = 0
            tempo_count = 0
            
            for track in mid.tracks:
                for msg in track:
                    if msg.type == 'note_on' and msg.velocity > 0:
                        note_count += 1
                    elif msg.type == 'set_tempo':
                        tempo_count += 1
            
            validation["has_notes"] = note_count > 0
            validation["tempo_changes"] = tempo_count
            validation["note_count"] = note_count
            
            # Flag potential issues
            if note_count == 0:
                validation["issues"].append("No note events found")
            if mid.length < 0.1:
                validation["issues"].append("Very short duration")
            if len(mid.tracks) == 0:
                validation["issues"].append("No tracks found")
                
            return validation
            
        except Exception as e:
            return {
                "valid": False,
                "path": str(file_path),
                "error": str(e),
                "issues": [f"File corruption or invalid format: {str(e)}"]
            }

    def validate_templates(self):
        """Validate all template MIDI files"""
        print("🎵 Validating MIDI templates...")
        
        template_files = list(self.templates_dir.rglob("*.mid")) + list(self.templates_dir.rglob("*.midi"))
        self.validation_report["templates"]["total"] = len(template_files)
        
        for midi_file in template_files:
            validation = self.validate_midi_file(midi_file)
            if validation["valid"] and not validation["issues"]:
                self.validation_report["templates"]["valid"] += 1
            else:
                self.validation_report["templates"]["invalid"].append(validation)
        
        print(f"   Templates: {self.validation_report['templates']['valid']}/{self.validation_report['templates']['total']} valid")

    def validate_groove_dataset(self):
        """Validate groove dataset MIDI files"""
        print("🥁 Validating groove dataset...")
        
        groove_files = list(self.groove_dir.rglob("*.mid"))
        self.validation_report["groove_dataset"]["total"] = len(groove_files)
        
        for midi_file in groove_files:
            validation = self.validate_midi_file(midi_file)
            if validation["valid"] and not validation["issues"]:
                self.validation_report["groove_dataset"]["valid"] += 1
            else:
                self.validation_report["groove_dataset"]["invalid"].append(validation)
        
        print(f"   Groove files: {self.validation_report['groove_dataset']['valid']}/{self.validation_report['groove_dataset']['total']} valid")

    def validate_generated_files(self):
        """Validate generated MIDI files"""
        print("🎼 Validating generated MIDI files...")
        
        generated_files = list(self.generated_dir.glob("*.mid"))
        self.validation_report["generated"]["total"] = len(generated_files)
        
        for midi_file in generated_files:
            validation = self.validate_midi_file(midi_file)
            if validation["valid"] and not validation["issues"]:
                self.validation_report["generated"]["valid"] += 1
            else:
                self.validation_report["generated"]["invalid"].append(validation)
        
        print(f"   Generated files: {self.validation_report['generated']['valid']}/{self.validation_report['generated']['total']} valid")

    def validate_chord_sets(self):
        """Validate chord set MIDI files"""
        print("🎹 Validating chord sets...")
        
        chord_dir = self.templates_dir / "chord-sets"
        if chord_dir.exists():
            chord_files = list(chord_dir.rglob("*.mid"))
            self.validation_report["chord_sets"]["total"] = len(chord_files)
            
            for midi_file in chord_files:
                validation = self.validate_midi_file(midi_file)
                if validation["valid"] and not validation["issues"]:
                    self.validation_report["chord_sets"]["valid"] += 1
                else:
                    self.validation_report["chord_sets"]["invalid"].append(validation)
        
        print(f"   Chord sets: {self.validation_report['chord_sets']['valid']}/{self.validation_report['chord_sets']['total']} valid")

    def validate_catalogs(self):
        """Check if all catalogs are present and up to date"""
        print("📚 Validating catalogs...")
        
        expected_catalogs = [
            self.templates_dir / "midi_catalog.json",
            self.groove_dir / "groove_catalog.json",
            self.templates_dir / "chord-sets" / "chord_sets_catalog.json"
        ]
        
        for catalog_path in expected_catalogs:
            if not catalog_path.exists():
                self.validation_report["catalogs"]["missing"].append(str(catalog_path))
            else:
                # Check if catalog is recent
                try:
                    with open(catalog_path, 'r') as f:
                        catalog_data = json.load(f)
                    
                    # Basic validation of catalog structure
                    if isinstance(catalog_data, dict):
                        if "total_files" in catalog_data or "groove_patterns" in catalog_data:
                            print(f"   ✅ {catalog_path.name} - OK")
                        else:
                            self.validation_report["catalogs"]["outdated"].append(str(catalog_path))
                except Exception as e:
                    self.validation_report["errors"].append(f"Error reading {catalog_path}: {str(e)}")

    def fix_invalid_files(self):
        """Attempt to fix or remove invalid MIDI files"""
        print("🔧 Attempting to fix invalid files...")
        
        all_invalid = (
            self.validation_report["templates"]["invalid"] +
            self.validation_report["generated"]["invalid"] +
            self.validation_report["groove_dataset"]["invalid"] +
            self.validation_report["chord_sets"]["invalid"]
        )
        
        for invalid_file in all_invalid:
            file_path = Path(invalid_file["path"])
            
            if not invalid_file.get("valid", True):
                # File is completely corrupted
                print(f"   ❌ Removing corrupted file: {file_path.name}")
                try:
                    file_path.unlink()
                except Exception as e:
                    print(f"   Error removing {file_path}: {e}")
            else:
                # File has issues but might be fixable
                issues = invalid_file.get("issues", [])
                if "No note events found" in issues:
                    print(f"   ⚠️  Empty MIDI file detected: {file_path.name}")

    def regenerate_catalogs(self):
        """Regenerate all MIDI catalogs"""
        print("📝 Regenerating catalogs...")
        
        # Import and run catalog generators
        try:
            # Run MIDI catalog
            os.system("python3 server/midi-catalog.py --scan")
            print("   ✅ MIDI template catalog updated")
        except Exception as e:
            print(f"   ❌ Error updating MIDI catalog: {e}")
        
        try:
            # Run groove dataset catalog if needed
            if self.groove_dir.exists():
                os.system("python3 server/groove-dataset-loader.py --extract")
                print("   ✅ Groove dataset catalog updated")
        except Exception as e:
            print(f"   ❌ Error updating groove catalog: {e}")

    def create_missing_directories(self):
        """Ensure all required directories exist"""
        required_dirs = [
            self.midi_base,
            self.templates_dir,
            self.generated_dir,
            self.templates_dir / "chord-sets",
            self.templates_dir / "chord-sets" / "fast-progressions",
            self.templates_dir / "chord-sets" / "medium-progressions",
            self.templates_dir / "chord-sets" / "slow-progressions",
            self.midi_base / "user-uploads"
        ]
        
        for directory in required_dirs:
            directory.mkdir(parents=True, exist_ok=True)

    def run_full_validation(self):
        """Run complete MIDI validation process"""
        print("🎵 MIDI Validation and Processing")
        print("=" * 50)
        
        # Ensure directories exist
        self.create_missing_directories()
        
        # Validate all MIDI files
        self.validate_templates()
        self.validate_groove_dataset()
        self.validate_generated_files()
        self.validate_chord_sets()
        self.validate_catalogs()
        
        # Fix issues
        self.fix_invalid_files()
        
        # Regenerate catalogs
        self.regenerate_catalogs()
        
        # Generate report
        self.generate_report()

    def generate_report(self):
        """Generate validation report"""
        print("\n📊 VALIDATION REPORT")
        print("=" * 50)
        
        total_files = (
            self.validation_report["templates"]["total"] +
            self.validation_report["generated"]["total"] +
            self.validation_report["groove_dataset"]["total"] +
            self.validation_report["chord_sets"]["total"]
        )
        
        total_valid = (
            self.validation_report["templates"]["valid"] +
            self.validation_report["generated"]["valid"] +
            self.validation_report["groove_dataset"]["valid"] +
            self.validation_report["chord_sets"]["valid"]
        )
        
        print(f"Total MIDI files processed: {total_files}")
        print(f"Valid files: {total_valid}")
        print(f"Success rate: {(total_valid/total_files*100):.1f}%" if total_files > 0 else "No files found")
        
        # Save detailed report
        report_path = self.midi_base / "validation_report.json"
        with open(report_path, 'w') as f:
            json.dump(self.validation_report, f, indent=2)
        
        print(f"\nDetailed report saved to: {report_path}")
        
        if self.validation_report["catalogs"]["missing"]:
            print(f"\n⚠️  Missing catalogs: {len(self.validation_report['catalogs']['missing'])}")
        
        if any(self.validation_report[key]["invalid"] for key in ["templates", "generated", "groove_dataset", "chord_sets"]):
            print("⚠️  Some invalid files found - check detailed report")
        else:
            print("✅ All MIDI files are valid and ready to function!")

def main():
    parser = argparse.ArgumentParser(description='MIDI Validation and Processing')
    parser.add_argument('--validate', action='store_true', help='Run full validation')
    parser.add_argument('--fix', action='store_true', help='Fix invalid files')
    parser.add_argument('--catalogs', action='store_true', help='Regenerate catalogs only')
    
    args = parser.parse_args()
    
    validator = MidiValidator()
    
    if args.validate or not any([args.fix, args.catalogs]):
        validator.run_full_validation()
    elif args.fix:
        validator.fix_invalid_files()
    elif args.catalogs:
        validator.regenerate_catalogs()

if __name__ == "__main__":
    main()
