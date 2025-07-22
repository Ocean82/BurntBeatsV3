
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LandingPage } from '../../client/src/components/LandingPage';
import { AudioLDM2Generator } from '../../client/src/components/AudioLDM2Generator';

describe('Component Validation Tests', () => {
  describe('LandingPage Component', () => {
    test('renders all pricing tiers correctly', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      // Verify all pricing tiers
      expect(screen.getByText('Bonus Track')).toBeInTheDocument();
      expect(screen.getByText('$0.99')).toBeInTheDocument();
      expect(screen.getByText('Base Song')).toBeInTheDocument();
      expect(screen.getByText('$1.99')).toBeInTheDocument();
      expect(screen.getByText('Premium Song')).toBeInTheDocument();
      expect(screen.getByText('$4.99')).toBeInTheDocument();
      expect(screen.getByText('Ultra Super Great Amazing Song')).toBeInTheDocument();
      expect(screen.getByText('$8.99')).toBeInTheDocument();
    });

    test('displays feature highlights correctly', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      expect(screen.getByText('✓ No Monthly Fees')).toBeInTheDocument();
      expect(screen.getByText('✓ Pay Per Download')).toBeInTheDocument();
      expect(screen.getByText('✓ Royalty Free')).toBeInTheDocument();
    });

    test('full license section is displayed', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      expect(screen.getByText('Full License')).toBeInTheDocument();
      expect(screen.getByText('$10.00 USD')).toBeInTheDocument();
      expect(screen.getByText('Full ownership rights')).toBeInTheDocument();
      expect(screen.getByText('Commercial use allowed')).toBeInTheDocument();
    });

    test('calls onGetStarted when buttons are clicked', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      const startButton = screen.getByText('Start Creating Now');
      fireEvent.click(startButton);
      
      expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
    });

    test('download buttons trigger onGetStarted', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      const downloadButtons = screen.getAllByText('Download Now');
      fireEvent.click(downloadButtons[0]);
      
      expect(mockOnGetStarted).toHaveBeenCalledTimes(1);
    });
  });

  describe('AudioLDM2Generator Component', () => {
    test('renders music generation form', () => {
      const mockOnAudioGenerated = jest.fn();
      render(<AudioLDM2Generator onAudioGenerated={mockOnAudioGenerated} />);

      expect(screen.getByText('AI Music Generation')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe the music you want to generate...')).toBeInTheDocument();
      expect(screen.getByText('Generate Music')).toBeInTheDocument();
    });

    test('form inputs work correctly', () => {
      const mockOnAudioGenerated = jest.fn();
      render(<AudioLDM2Generator onAudioGenerated={mockOnAudioGenerated} />);

      const promptInput = screen.getByPlaceholderText('Describe the music you want to generate...');
      fireEvent.change(promptInput, { target: { value: 'upbeat electronic music' } });
      
      expect(promptInput.value).toBe('upbeat electronic music');
    });

    test('duration slider works', () => {
      const mockOnAudioGenerated = jest.fn();
      render(<AudioLDM2Generator onAudioGenerated={mockOnAudioGenerated} />);

      const durationSlider = screen.getByRole('slider');
      fireEvent.change(durationSlider, { target: { value: '20' } });
      
      expect(durationSlider.value).toBe('20');
    });
  });

  describe('UI Styling and Accessibility', () => {
    test('landing page has proper heading hierarchy', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Burnt Beats');
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });

    test('buttons have proper accessibility attributes', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    test('pricing cards have proper structure', () => {
      const mockOnGetStarted = jest.fn();
      render(<LandingPage onGetStarted={mockOnGetStarted} />);

      // Check that pricing information is properly structured
      expect(screen.getByText('Bonus Track')).toBeInTheDocument();
      expect(screen.getByText('Demo piece with watermark overlay')).toBeInTheDocument();
      
      expect(screen.getByText('Premium Song')).toBeInTheDocument();
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });
  });
});
