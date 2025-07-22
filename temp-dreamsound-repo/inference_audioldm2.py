
#!/usr/bin/env python3
"""
AudioLDM2 Inference Script for Burnt Beats
Generates personalized music using trained AudioLDM2 models
"""

import argparse
import torch
import scipy.io.wavfile
from pipeline.pipeline_audioldm2 import AudioLDM2Pipeline

def main():
    parser = argparse.ArgumentParser(description="Generate music with AudioLDM2")
    parser.add_argument("--prompt", type=str, required=True, help="Text prompt for music generation")
    parser.add_argument("--model_path", type=str, required=True, help="Path to trained model or model name")
    parser.add_argument("--output_file", type=str, required=True, help="Output audio file path")
    parser.add_argument("--num_inference_steps", type=int, default=50, help="Number of inference steps")
    parser.add_argument("--guidance_scale", type=float, default=3.5, help="Guidance scale")
    parser.add_argument("--audio_length_in_s", type=float, default=10.0, help="Audio length in seconds")
    parser.add_argument("--instance_word", type=str, help="Instance word for personalized generation")
    parser.add_argument("--object_class", type=str, help="Object class for personalized generation")
    
    args = parser.parse_args()
    
    # Load the pipeline
    print(f"Loading AudioLDM2 pipeline from {args.model_path}")
    pipeline = AudioLDM2Pipeline.from_pretrained(
        args.model_path,
        torch_dtype=torch.float16
    )
    
    # Move to GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipeline = pipeline.to(device)
    
    # Prepare prompt
    prompt = args.prompt
    if args.instance_word and args.object_class:
        prompt = f"a recording of a {args.instance_word} {args.object_class}, {prompt}"
    
    print(f"Generating audio with prompt: '{prompt}'")
    
    # Generate audio
    generator = torch.Generator(device=device).manual_seed(42) if device == "cuda" else None
    
    with torch.no_grad():
        audio = pipeline(
            prompt,
            num_inference_steps=args.num_inference_steps,
            guidance_scale=args.guidance_scale,
            audio_length_in_s=args.audio_length_in_s,
            num_waveforms_per_prompt=1,
            generator=generator
        ).audios[0]
    
    # Save the audio
    print(f"Saving audio to {args.output_file}")
    scipy.io.wavfile.write(args.output_file, rate=16000, data=audio)
    print("Audio generation completed successfully!")

if __name__ == "__main__":
    main()
