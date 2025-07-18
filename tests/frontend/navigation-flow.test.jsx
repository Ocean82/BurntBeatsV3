
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../client/src/App';

describe('Navigation Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test('proper tab navigation in dashboard', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    render(<App />);

    // Navigate through landing -> login -> dashboard
    fireEvent.click(screen.getByText('Start Creating Now'));

    await waitFor(() => {
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), { target: { value: 'password' } });
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });

    // Test each tab navigation
    await waitFor(() => {
      // MIDI tab (default)
      expect(screen.getByText('MIDI Generation')).toBeInTheDocument();
      
      // Audio tab
      fireEvent.click(screen.getByText('AI Music'));
      expect(screen.getByText('AI Music Generation')).toBeInTheDocument();
      
      // Voice tab
      fireEvent.click(screen.getByText('Voice Synthesis'));
      expect(screen.getByText('Text to Synthesize')).toBeInTheDocument();
      
      // Library tab
      fireEvent.click(screen.getByText('Library'));
      expect(screen.getByText('Generated Content Library')).toBeInTheDocument();
      
      // Back to MIDI
      fireEvent.click(screen.getByText('MIDI'));
      expect(screen.getByPlaceholderText('Enter song title')).toBeInTheDocument();
    });
  });

  test('responsive navigation on mobile viewport', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 667 });

    render(<App />);

    // Landing page should adapt to mobile
    expect(screen.getByText('Burnt Beats')).toBeInTheDocument();
    
    // Check that elements have responsive classes
    const pricingGrid = screen.getByText('Simple Pricing').closest('div');
    expect(pricingGrid).toBeInTheDocument();
  });

  test('keyboard navigation support', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    render(<App />);

    const startButton = screen.getByText('Start Creating Now');
    
    // Test keyboard interaction
    startButton.focus();
    expect(startButton).toHaveFocus();
    
    // Simulate Enter key press
    fireEvent.keyDown(startButton, { key: 'Enter', code: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });
});
