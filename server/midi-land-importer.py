
#!/usr/bin/env python3
"""
MIDI Land Rhythm Files Importer
Imports and processes advanced rhythm files from Ocean82/midi_land repository
"""

import os
import json
import mido
import requests
import shutil
from pathlib import Path
from datetime import datetime
import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MidiLandImporter:
    def __init__(self):
        self.base_path = Path(".")
        self.storage_path = Path("storage/midi")
        self.rhythm_path = self.storage_path / "rhythm-patterns"
        self.advanced_path = self.rhythm_path / "advanced"
        self.midi_land_path = self.advanced_path / "midi_land"
        
        # GitHub API base URL for Ocean82/midi_land
        self.github_api_base = "https://api.github.com/repos/Ocean82/midi_land"
        self.github_raw_base = "https://raw.githubusercontent.com/Ocean82/midi_land/main"
        
        # Setup directories
        self._setup_directories()
        
        self.import_report = {
            'timestamp': datetime.now().isoformat(),
            'source': 'Ocean82/midi_land',
            'imported_files': [],
            'categorized_files': [],
            'errors': []
        }

    def _setup_directories(self):
        """Setup directory structure for rhythm patterns"""
        directories = [
            self.rhythm_path,
            self.advanced_path,
            self.midi_land_path,
            self.midi_land_path / "drums",
            self.midi_land_path / "percussion",
            self.midi_land_path / "patterns",
            self.midi_land_path / "fills",
            self.midi_land_path / "breakbeats",
            self.midi_land_path / "world_rhythms"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)

    def fetch_repository_contents(self):
        """Fetch contents from Ocean82/midi_land repository"""
        try:
            logger.info("🔍 Fetching repository contents from Ocean82/midi_land...")
            
            # Get repository structure
            response = requests.get(f"{self.github_api_base}/contents", timeout=30)
            
            if response.status_code == 200:
                contents = response.json()
                midi_files = []
                
                for item in contents:
                    if item['type'] == 'file' and item['name'].lower().endswith(('.mid', '.midi')):
                        midi_files.append(item)
                    elif item['type'] == 'dir':
                        # Recursively check directories
                        dir_files = self._fetch_directory_contents(item['path'])
                        midi_files.extend(dir_files)
                
                logger.info(f"📊 Found {len(midi_files)} MIDI files in repository")
                return midi_files
            else:
                logger.error(f"Failed to fetch repository contents: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching repository contents: {e}")
            self.import_report['errors'].append(f"Repository fetch error: {e}")
            return []

    def _fetch_directory_contents(self, dir_path):
        """Recursively fetch MIDI files from subdirectories"""
        try:
            response = requests.get(f"{self.github_api_base}/contents/{dir_path}", timeout=30)
            
            if response.status_code == 200:
                contents = response.json()
                midi_files = []
                
                for item in contents:
                    if item['type'] == 'file' and item['name'].lower().endswith(('.mid', '.midi')):
                        midi_files.append(item)
                    elif item['type'] == 'dir':
                        # Continue recursion
                        subdir_files = self._fetch_directory_contents(item['path'])
                        midi_files.extend(subdir_files)
                
                return midi_files
            else:
                return []
                
        except Exception as e:
            logger.warning(f"Error fetching directory {dir_path}: {e}")
            return []

    def download_midi_file(self, file_info):
        """Download a MIDI file from the repository"""
        try:
            file_name = file_info['name']
            download_url = file_info['download_url']
            
            logger.info(f"⬇️  Downloading {file_name}...")
            
            response = requests.get(download_url, timeout=30)
            
            if response.status_code == 200:
                # Determine category based on file path or name
                category = self._categorize_rhythm_file(file_info)
                category_path = self.midi_land_path / category
                
                file_path = category_path / file_name
                
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                
                # Analyze the MIDI file
                analysis = self._analyze_rhythm_file(file_path)
                
                file_record = {
                    'filename': file_name,
                    'original_path': file_info['path'],
                    'local_path': str(file_path),
                    'category': category,
                    'size': len(response.content),
                    'analysis': analysis,
                    'downloaded_at': datetime.now().isoformat()
                }
                
                self.import_report['imported_files'].append(file_record)
                logger.info(f"✅ Successfully imported {file_name} -> {category}")
                
                return file_record
            else:
                logger.error(f"Failed to download {file_name}: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error downloading {file_info['name']}: {e}")
            self.import_report['errors'].append(f"Download error for {file_info['name']}: {e}")
            return None

    def _categorize_rhythm_file(self, file_info):
        """Categorize rhythm file based on path and name"""
        file_path = file_info['path'].lower()
        file_name = file_info['name'].lower()
        
        # Categorization logic
        if 'drum' in file_path or 'drum' in file_name:
            return 'drums'
        elif 'percussion' in file_path or 'perc' in file_name:
            return 'percussion'
        elif 'break' in file_path or 'break' in file_name:
            return 'breakbeats'
        elif 'fill' in file_path or 'fill' in file_name:
            return 'fills'
        elif any(world in file_path for world in ['latin', 'african', 'asian', 'world']):
            return 'world_rhythms'
        else:
            return 'patterns'

    def _analyze_rhythm_file(self, file_path):
        """Analyze rhythm MIDI file for metadata"""
        try:
            mid = mido.MidiFile(file_path)
            
            analysis = {
                'type': mid.type,
                'ticks_per_beat': mid.ticks_per_beat,
                'length_seconds': mid.length,
                'num_tracks': len(mid.tracks),
                'tempo_changes': [],
                'time_signatures': [],
                'drum_notes': [],
                'note_density': 0
            }
            
            total_notes = 0
            
            for i, track in enumerate(mid.tracks):
                track_notes = []
                
                for msg in track:
                    if msg.type == 'set_tempo':
                        bpm = mido.tempo2bpm(msg.tempo)
                        analysis['tempo_changes'].append({
                            'track': i,
                            'time': msg.time,
                            'tempo': msg.tempo,
                            'bpm': round(bpm, 2)
                        })
                    
                    elif msg.type == 'time_signature':
                        analysis['time_signatures'].append({
                            'track': i,
                            'time': msg.time,
                            'numerator': msg.numerator,
                            'denominator': msg.denominator
                        })
                    
                    elif msg.type == 'note_on' and msg.velocity > 0:
                        # Check if it's a drum note (channel 9 is percussion)
                        if msg.channel == 9:
                            analysis['drum_notes'].append({
                                'note': msg.note,
                                'velocity': msg.velocity,
                                'time': msg.time
                            })
                        
                        track_notes.append(msg.note)
                        total_notes += 1
                
            # Calculate note density (notes per second)
            if analysis['length_seconds'] > 0:
                analysis['note_density'] = round(total_notes / analysis['length_seconds'], 2)
            
            # Determine primary tempo
            if analysis['tempo_changes']:
                analysis['primary_bpm'] = analysis['tempo_changes'][0]['bpm']
            else:
                analysis['primary_bpm'] = 120  # Default
            
            # Determine time signature
            if analysis['time_signatures']:
                ts = analysis['time_signatures'][0]
                analysis['primary_time_signature'] = f"{ts['numerator']}/{ts['denominator']}"
            else:
                analysis['primary_time_signature'] = "4/4"  # Default
                
            return analysis
            
        except Exception as e:
            logger.warning(f"Could not analyze {file_path}: {e}")
            return {'error': str(e)}

    def import_all_files(self):
        """Import all MIDI files from the repository"""
        logger.info("🚀 Starting MIDI Land import process...")
        
        # Fetch repository contents
        midi_files = self.fetch_repository_contents()
        
        if not midi_files:
            logger.error("No MIDI files found or could not access repository")
            return
        
        # Download and process each file
        for file_info in midi_files:
            try:
                self.download_midi_file(file_info)
            except Exception as e:
                logger.error(f"Error processing {file_info['name']}: {e}")
                continue
        
        # Generate catalog
        self._generate_rhythm_catalog()
        
        # Save import report
        self._save_import_report()
        
        logger.info(f"🎉 Import completed!")
        logger.info(f"   Imported: {len(self.import_report['imported_files'])} files")
        logger.info(f"   Errors: {len(self.import_report['errors'])} files")

    def _generate_rhythm_catalog(self):
        """Generate catalog of imported rhythm files"""
        logger.info("📚 Generating rhythm pattern catalog...")
        
        catalog = {
            'generated_at': datetime.now().isoformat(),
            'source': 'Ocean82/midi_land',
            'total_files': len(self.import_report['imported_files']),
            'categories': {},
            'tempo_ranges': {},
            'rhythm_files': []
        }
        
        # Organize by categories
        for file_record in self.import_report['imported_files']:
            category = file_record['category']
            
            if category not in catalog['categories']:
                catalog['categories'][category] = {
                    'count': 0,
                    'files': []
                }
            
            catalog['categories'][category]['count'] += 1
            catalog['categories'][category]['files'].append({
                'filename': file_record['filename'],
                'path': file_record['local_path'],
                'analysis': file_record['analysis']
            })
            
            # Add to main list
            catalog['rhythm_files'].append(file_record)
            
            # Track tempo ranges
            if 'primary_bpm' in file_record['analysis']:
                bpm = file_record['analysis']['primary_bpm']
                tempo_range = self._get_tempo_range(bpm)
                
                if tempo_range not in catalog['tempo_ranges']:
                    catalog['tempo_ranges'][tempo_range] = {
                        'count': 0,
                        'bpm_range': tempo_range,
                        'files': []
                    }
                
                catalog['tempo_ranges'][tempo_range]['count'] += 1
                catalog['tempo_ranges'][tempo_range]['files'].append(file_record['filename'])
        
        # Save catalog
        catalog_path = self.midi_land_path / "rhythm_catalog.json"
        with open(catalog_path, 'w') as f:
            json.dump(catalog, f, indent=2)
        
        logger.info(f"📊 Catalog saved: {catalog_path}")

    def _get_tempo_range(self, bpm):
        """Get tempo range category"""
        if bmp < 80:
            return 'slow'
        elif bpm < 120:
            return 'medium'
        elif bpm < 160:
            return 'fast'
        else:
            return 'very_fast'

    def _save_import_report(self):
        """Save import report"""
        report_path = self.midi_land_path / "import_report.json"
        
        with open(report_path, 'w') as f:
            json.dump(self.import_report, f, indent=2)
        
        logger.info(f"📋 Import report saved: {report_path}")

def main():
    parser = argparse.ArgumentParser(description='Import Ocean82/midi_land rhythm files')
    parser.add_argument('--import', action='store_true', help='Import all files from repository')
    parser.add_argument('--catalog-only', action='store_true', help='Generate catalog from existing files')
    
    args = parser.parse_args()
    
    importer = MidiLandImporter()
    
    if args.import or not any([args.catalog_only]):
        # Default action is to import
        importer.import_all_files()
    elif args.catalog_only:
        importer._generate_rhythm_catalog()

if __name__ == "__main__":
    main()
