
#!/usr/bin/env python3
"""
AFPK File Analyzer for Burnt Beats
Analyzes .afpk files to determine if they contain extractable audio/MIDI data
"""

import os
import struct
import json
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AFPKAnalyzer:
    def __init__(self):
        self.afpk_files = []
        self.analysis_results = []
    
    def find_afpk_files(self):
        """Find all .afpk files in the system"""
        logger.info("🔍 Searching for .afpk files...")
        
        search_paths = [
            Path("attached_assets"),
            Path("mir-data"),
            Path("storage")
        ]
        
        for search_path in search_paths:
            if search_path.exists():
                for afpk_file in search_path.rglob("*.afpk"):
                    if afpk_file.is_file() and afpk_file.stat().st_size > 0:
                        self.afpk_files.append(afpk_file)
                        logger.info(f"Found AFPK: {afpk_file}")
        
        logger.info(f"📊 Found {len(self.afpk_files)} AFPK files")
        return self.afpk_files
    
    def analyze_afpk_file(self, afpk_path: Path):
        """Analyze an AFPK file to determine its content type"""
        try:
            with open(afpk_path, 'rb') as f:
                # Read first 1024 bytes for header analysis
                header_data = f.read(1024)
                
                analysis = {
                    'filename': afpk_path.name,
                    'path': str(afpk_path),
                    'size': afpk_path.stat().st_size,
                    'header_preview': header_data[:64].hex(),
                    'potential_formats': []
                }
                
                # Check for common audio/MIDI signatures
                if header_data.startswith(b'MThd'):
                    analysis['potential_formats'].append('MIDI')
                    analysis['likely_type'] = 'MIDI file'
                elif header_data.startswith(b'RIFF'):
                    analysis['potential_formats'].append('WAV')
                    analysis['likely_type'] = 'WAV audio'
                elif header_data.startswith(b'ID3') or header_data[1:4] == b'ID3':
                    analysis['potential_formats'].append('MP3')
                    analysis['likely_type'] = 'MP3 audio'
                elif b'ftyp' in header_data[:20]:
                    analysis['potential_formats'].append('MP4/M4A')
                    analysis['likely_type'] = 'MP4/M4A audio'
                elif header_data.startswith(b'OggS'):
                    analysis['potential_formats'].append('OGG')
                    analysis['likely_type'] = 'OGG audio'
                elif header_data.startswith(b'FLAC'):
                    analysis['potential_formats'].append('FLAC')
                    analysis['likely_type'] = 'FLAC audio'
                else:
                    # Check for text-based formats
                    try:
                        text_content = header_data.decode('utf-8', errors='ignore')
                        if 'json' in text_content.lower() or text_content.strip().startswith('{'):
                            analysis['potential_formats'].append('JSON')
                            analysis['likely_type'] = 'JSON metadata'
                        elif text_content.strip().startswith('<'):
                            analysis['potential_formats'].append('XML')
                            analysis['likely_type'] = 'XML metadata'
                        else:
                            analysis['likely_type'] = 'Binary/Unknown'
                    except:
                        analysis['likely_type'] = 'Binary/Unknown'
                
                # Additional analysis for audio fingerprint patterns
                if 'audio' not in analysis.get('likely_type', '').lower():
                    # Check for patterns that might indicate audio fingerprint data
                    if len(set(header_data)) > 200:  # High entropy suggests binary data
                        analysis['potential_formats'].append('Audio Fingerprint')
                        analysis['likely_type'] = 'Audio fingerprint/feature data'
                
                return analysis
                
        except Exception as e:
            logger.error(f"Error analyzing {afpk_path}: {e}")
            return {
                'filename': afpk_path.name,
                'path': str(afpk_path),
                'error': str(e)
            }
    
    def attempt_extraction(self, afpk_path: Path, analysis):
        """Attempt to extract usable content from AFPK file"""
        extraction_attempts = []
        
        try:
            # If it might be a renamed audio file, try copying with different extensions
            if 'WAV' in analysis.get('potential_formats', []):
                wav_path = Path(f"storage/temp/{afpk_path.stem}.wav")
                wav_path.parent.mkdir(parents=True, exist_ok=True)
                with open(afpk_path, 'rb') as src, open(wav_path, 'wb') as dst:
                    dst.write(src.read())
                extraction_attempts.append({'format': 'WAV', 'path': str(wav_path)})
            
            if 'MIDI' in analysis.get('potential_formats', []):
                mid_path = Path(f"storage/temp/{afpk_path.stem}.mid")
                mid_path.parent.mkdir(parents=True, exist_ok=True)
                with open(afpk_path, 'rb') as src, open(mid_path, 'wb') as dst:
                    dst.write(src.read())
                extraction_attempts.append({'format': 'MIDI', 'path': str(mid_path)})
            
            if 'JSON' in analysis.get('potential_formats', []):
                json_path = Path(f"storage/temp/{afpk_path.stem}.json")
                json_path.parent.mkdir(parents=True, exist_ok=True)
                with open(afpk_path, 'rb') as src:
                    content = src.read()
                    try:
                        # Try to decode and pretty-print JSON
                        json_content = json.loads(content.decode('utf-8'))
                        with open(json_path, 'w') as dst:
                            json.dump(json_content, dst, indent=2)
                        extraction_attempts.append({'format': 'JSON', 'path': str(json_path)})
                    except:
                        # Save as raw text
                        with open(json_path, 'w') as dst:
                            dst.write(content.decode('utf-8', errors='ignore'))
                        extraction_attempts.append({'format': 'TEXT', 'path': str(json_path)})
            
        except Exception as e:
            logger.error(f"Error extracting from {afpk_path}: {e}")
            extraction_attempts.append({'error': str(e)})
        
        return extraction_attempts
    
    def process_all_afpk_files(self):
        """Process all discovered AFPK files"""
        logger.info("🔄 Processing all AFPK files...")
        
        for afpk_file in self.afpk_files:
            logger.info(f"Analyzing: {afpk_file}")
            
            analysis = self.analyze_afpk_file(afpk_file)
            
            if 'error' not in analysis:
                # Attempt extraction if the file looks promising
                if analysis.get('likely_type') != 'Binary/Unknown':
                    extraction_results = self.attempt_extraction(afpk_file, analysis)
                    analysis['extraction_attempts'] = extraction_results
            
            self.analysis_results.append(analysis)
        
        # Save analysis report
        self._save_analysis_report()
        
        logger.info(f"🎉 AFPK analysis complete!")
        logger.info(f"   Analyzed: {len(self.analysis_results)} files")
    
    def _save_analysis_report(self):
        """Save AFPK analysis report"""
        report_path = Path("storage/afpk_analysis_report.json")
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w') as f:
            json.dump(self.analysis_results, f, indent=2)
        
        logger.info(f"📊 AFPK analysis report saved: {report_path}")

def main():
    analyzer = AFPKAnalyzer()
    analyzer.find_afpk_files()
    analyzer.process_all_afpk_files()
    
    # Print summary
    print("\n" + "="*50)
    print("AFPK ANALYSIS SUMMARY")
    print("="*50)
    
    for result in analyzer.analysis_results:
        print(f"\n📄 {result['filename']}")
        print(f"   Type: {result.get('likely_type', 'Unknown')}")
        print(f"   Size: {result.get('size', 0)} bytes")
        
        if 'extraction_attempts' in result:
            print(f"   Extractions: {len(result['extraction_attempts'])}")

if __name__ == "__main__":
    main()
