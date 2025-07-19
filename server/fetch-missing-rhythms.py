
#!/usr/bin/env python3
"""
Fetch Missing Rhythm Patterns from Ocean82/midi_land Repository
Compares existing groove collection with Ocean82 patterns and downloads missing ones
"""

import os
import json
import requests
import hashlib
from pathlib import Path
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RhythmFetcher:
    def __init__(self):
        self.base_url = "https://api.github.com/repos/Ocean82/midi_land"
        self.raw_base_url = "https://raw.githubusercontent.com/Ocean82/midi_land/main"
        self.local_groove_path = Path("storage/midi/groove-dataset")
        self.templates_path = Path("storage/midi/templates")
        self.new_patterns_path = Path("storage/midi/new-patterns")
        
        # Create directories
        self.new_patterns_path.mkdir(parents=True, exist_ok=True)
        
        # Track what we have vs what's available
        self.existing_patterns = set()
        self.ocean82_patterns = []
        self.missing_patterns = []
        
    def get_existing_patterns(self):
        """Get list of existing MIDI patterns"""
        logger.info("🔍 Scanning existing MIDI patterns...")
        
        search_paths = [
            self.local_groove_path,
            self.templates_path,
            Path("attached_assets"),
            Path("mir-data")
        ]
        
        for search_path in search_paths:
            if search_path.exists():
                for midi_file in search_path.rglob("*.mid"):
                    if midi_file.is_file():
                        # Create pattern identifier based on filename characteristics
                        name = midi_file.stem.lower()
                        # Extract tempo, style, and basic pattern info
                        pattern_id = self._create_pattern_id(name)
                        self.existing_patterns.add(pattern_id)
        
        logger.info(f"Found {len(self.existing_patterns)} existing patterns")
        
    def _create_pattern_id(self, filename):
        """Create a pattern identifier from filename"""
        # Remove common prefixes/suffixes and normalize
        cleaned = filename.replace("groove_", "").replace(".mid", "")
        
        # Extract key components (tempo, style, type)
        parts = cleaned.split("_")
        if len(parts) >= 3:
            # Try to find tempo and style
            tempo = None
            style = None
            
            for part in parts:
                if part.isdigit() and 60 <= int(part) <= 250:
                    tempo = part
                elif part in ['rock', 'funk', 'jazz', 'latin', 'blues', 'reggae', 'hiphop']:
                    style = part
            
            if tempo and style:
                return f"{style}_{tempo}"
        
        return hashlib.md5(cleaned.encode()).hexdigest()[:8]
    
    def fetch_ocean82_patterns(self):
        """Fetch list of patterns from Ocean82 repository"""
        logger.info("🌊 Fetching Ocean82/midi_land patterns...")
        
        try:
            # Get repository contents
            response = requests.get(f"{self.base_url}/contents")
            response.raise_for_status()
            
            contents = response.json()
            
            # Look for MIDI files and directories
            self._scan_repo_contents(contents, "")
            
            logger.info(f"Found {len(self.ocean82_patterns)} patterns in Ocean82 repository")
            
        except Exception as e:
            logger.error(f"Error fetching Ocean82 patterns: {e}")
    
    def _scan_repo_contents(self, contents, path_prefix):
        """Recursively scan repository contents for MIDI files"""
        for item in contents:
            if item['type'] == 'file' and item['name'].endswith('.mid'):
                pattern_info = {
                    'name': item['name'],
                    'path': f"{path_prefix}/{item['name']}" if path_prefix else item['name'],
                    'download_url': item['download_url'],
                    'size': item['size'],
                    'pattern_id': self._create_pattern_id(item['name'])
                }
                self.ocean82_patterns.append(pattern_info)
                
            elif item['type'] == 'dir':
                # Recursively scan subdirectories
                try:
                    subdir_response = requests.get(item['url'])
                    subdir_response.raise_for_status()
                    subdir_contents = subdir_response.json()
                    
                    new_path = f"{path_prefix}/{item['name']}" if path_prefix else item['name']
                    self._scan_repo_contents(subdir_contents, new_path)
                    
                except Exception as e:
                    logger.warning(f"Could not scan subdirectory {item['name']}: {e}")
    
    def find_missing_patterns(self):
        """Compare existing patterns with Ocean82 patterns to find missing ones"""
        logger.info("🔍 Finding missing patterns...")
        
        for pattern in self.ocean82_patterns:
            if pattern['pattern_id'] not in self.existing_patterns:
                self.missing_patterns.append(pattern)
        
        logger.info(f"Found {len(self.missing_patterns)} missing patterns")
        
        # Log some examples
        if self.missing_patterns:
            logger.info("Examples of missing patterns:")
            for pattern in self.missing_patterns[:10]:
                logger.info(f"  - {pattern['name']} ({pattern['pattern_id']})")
    
    def download_missing_patterns(self, limit=50):
        """Download missing patterns with optional limit"""
        logger.info(f"⬇️  Downloading up to {limit} missing patterns...")
        
        downloaded = 0
        failed = 0
        
        for pattern in self.missing_patterns[:limit]:
            try:
                # Download the file
                response = requests.get(pattern['download_url'])
                response.raise_for_status()
                
                # Save to new patterns directory
                file_path = self.new_patterns_path / pattern['name']
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                
                logger.info(f"✅ Downloaded: {pattern['name']}")
                downloaded += 1
                
            except Exception as e:
                logger.error(f"❌ Failed to download {pattern['name']}: {e}")
                failed += 1
        
        logger.info(f"📊 Download complete: {downloaded} successful, {failed} failed")
        
        # Generate report
        self._generate_report(downloaded, failed)
    
    def _generate_report(self, downloaded, failed):
        """Generate integration report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'existing_patterns_count': len(self.existing_patterns),
            'ocean82_patterns_count': len(self.ocean82_patterns),
            'missing_patterns_count': len(self.missing_patterns),
            'downloaded_patterns': downloaded,
            'failed_downloads': failed,
            'missing_patterns': self.missing_patterns,
            'download_location': str(self.new_patterns_path)
        }
        
        report_path = Path("storage/midi/ocean82_integration_report.json")
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"📋 Report saved: {report_path}")
    
    def integrate_new_patterns(self):
        """Integrate downloaded patterns into the main groove collection"""
        logger.info("🔄 Integrating new patterns...")
        
        if not self.new_patterns_path.exists():
            logger.warning("No new patterns directory found")
            return
        
        new_files = list(self.new_patterns_path.glob("*.mid"))
        if not new_files:
            logger.warning("No new MIDI files to integrate")
            return
        
        # Move files to appropriate categories
        integrated = 0
        for midi_file in new_files:
            try:
                # Determine category based on filename
                category = self._determine_category(midi_file.name)
                
                # Create target directory
                if 'funk' in midi_file.name.lower():
                    target_dir = self.templates_path / "groove-patterns" / "funk"
                elif 'rock' in midi_file.name.lower():
                    target_dir = self.templates_path / "groove-patterns" / "rock"
                elif 'jazz' in midi_file.name.lower():
                    target_dir = self.templates_path / "groove-patterns" / "jazz"
                else:
                    target_dir = self.templates_path / "groove-patterns" / "general"
                
                target_dir.mkdir(parents=True, exist_ok=True)
                
                # Move file
                target_path = target_dir / midi_file.name
                midi_file.rename(target_path)
                
                logger.info(f"✅ Integrated: {midi_file.name} → {target_dir.name}")
                integrated += 1
                
            except Exception as e:
                logger.error(f"❌ Failed to integrate {midi_file.name}: {e}")
        
        logger.info(f"🎉 Integration complete: {integrated} patterns integrated")
    
    def _determine_category(self, filename):
        """Determine category for a MIDI pattern based on filename"""
        filename_lower = filename.lower()
        
        if any(style in filename_lower for style in ['funk', 'soul']):
            return 'funk'
        elif any(style in filename_lower for style in ['rock', 'metal']):
            return 'rock'
        elif any(style in filename_lower for style in ['jazz', 'swing']):
            return 'jazz'
        elif any(style in filename_lower for style in ['latin', 'salsa', 'bossa']):
            return 'latin'
        elif any(style in filename_lower for style in ['blues', 'shuffle']):
            return 'blues'
        elif any(style in filename_lower for style in ['reggae', 'ska']):
            return 'reggae'
        elif any(style in filename_lower for style in ['hip', 'hop', 'rap']):
            return 'hiphop'
        else:
            return 'general'

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Fetch Missing Rhythm Patterns')
    parser.add_argument('--scan', action='store_true', help='Scan for missing patterns')
    parser.add_argument('--download', type=int, default=50, help='Download missing patterns (limit)')
    parser.add_argument('--integrate', action='store_true', help='Integrate downloaded patterns')
    parser.add_argument('--all', action='store_true', help='Run complete pipeline')
    
    args = parser.parse_args()
    
    fetcher = RhythmFetcher()
    
    if args.all or args.scan:
        fetcher.get_existing_patterns()
        fetcher.fetch_ocean82_patterns()
        fetcher.find_missing_patterns()
        
        if args.all or args.download:
            limit = args.download if args.download else 50
            fetcher.download_missing_patterns(limit)
            
        if args.all or args.integrate:
            fetcher.integrate_new_patterns()
    
    elif args.download:
        fetcher.get_existing_patterns()
        fetcher.fetch_ocean82_patterns()
        fetcher.find_missing_patterns()
        fetcher.download_missing_patterns(args.download)
    
    elif args.integrate:
        fetcher.integrate_new_patterns()
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
