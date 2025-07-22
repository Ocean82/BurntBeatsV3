
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../client/src/App';

describe('Frontend UI Flow Tests', () => {
  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
    
    // Mock fetch for API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Complete user flow: Landing -> Login -> Dashboard -> Music Generation', async () => {
    // Mock server status API call
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'online',
        version: '1.0.0',
        environment: 'test',
        message: 'Server is running'
      })
    });

    render(<App />);

    // Step 1: Landing page should be visible
    await waitFor(() => {
      expect(screen.getByText('Burnt Beats')).toBeInTheDocument();
      expect(screen.getByText('AI-Powered Music Creation Platform')).toBeInTheDocument();
    });

    // Step 2: Check pricing tiers are displayed
    expect(screen.getByText('Bonus Track')).toBeInTheDocument();
    expect(screen.getByText('Base Song')).toBeInTheDocument();
    expect(screen.getByText('Premium Song')).toBeInTheDocument();
    expect(screen.getByText('Ultra Super Great Amazing Song')).toBeInTheDocument();

    // Step 3: Click "Start Creating Now" to navigate to login
    const getStartedButton = screen.getByText('Start Creating Now');
    fireEvent.click(getStartedButton);

    // Step 4: Login form should appear
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    // Step 5: Fill in login form and submit
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    // Step 6: Dashboard should load with tabs
    await waitFor(() => {
      expect(screen.getByText('Welcome, User!')).toBeInTheDocument();
      expect(screen.getByText('MIDI Generation')).toBeInTheDocument();
      expect(screen.getByText('AI Music')).toBeInTheDocument();
      expect(screen.getByText('Voice Synthesis')).toBeInTheDocument();
      expect(screen.getByText('Library')).toBeInTheDocument();
    });

    // Step 7: Test tab navigation
    const audioTab = screen.getByText('AI Music');
    fireEvent.click(audioTab);

    await waitFor(() => {
      expect(screen.getByText('AI Music Generation')).toBeInTheDocument();
    });

    // Step 8: Test MIDI tab
    const midiTab = screen.getByText('MIDI Generation');
    fireEvent.click(midiTab);

    await waitFor(() => {
      expect(screen.getByText('MIDI Generation')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter song title')).toBeInTheDocument();
    });

    // Step 9: Test voice synthesis tab
    const voiceTab = screen.getByText('Voice Synthesis');
    fireEvent.click(voiceTab);

    await waitFor(() => {
      expect(screen.getByText('Voice Synthesis')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter text to convert to speech...')).toBeInTheDocument();
    });

    // Step 10: Test library tab
    const libraryTab = screen.getByText('Library');
    fireEvent.click(libraryTab);

    await waitFor(() => {
      expect(screen.getByText('Generated Content Library')).toBeInTheDocument();
    });
  });

  test('Landing page pricing tier interaction', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    render(<App />);

    // Check all pricing tiers have download buttons
    const downloadButtons = screen.getAllByText('Download Now');
    expect(downloadButtons).toHaveLength(4); // 4 pricing tiers

    // Check Full License section
    expect(screen.getByText('Full License')).toBeInTheDocument();
    expect(screen.getByText('$10.00 USD')).toBeInTheDocument();
    expect(screen.getByText('Get Full License')).toBeInTheDocument();
  });

  test('Login form validation and toggle', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    render(<App />);

    // Navigate to login
    const getStartedButton = screen.getByText('Start Creating Now');
    fireEvent.click(getStartedButton);

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    // Test toggle to Sign Up
    const signUpButton = screen.getByText('Sign Up');
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    // Toggle back to Login
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Enter your name')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Confirm your password')).not.toBeInTheDocument();
    });
  });

  test('Dashboard navigation and logout', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    render(<App />);

    // Skip to login and authenticate
    const getStartedButton = screen.getByText('Start Creating Now');
    fireEvent.click(getStartedButton);

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginBtn = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginBtn);
    });

    // Test logout functionality
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    // Should return to login screen
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });
  });

  test('Form inputs and validation in MIDI generation', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    render(<App />);

    // Navigate to dashboard
    const getStartedButton = screen.getByText('Start Creating Now');
    fireEvent.click(getStartedButton);

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const loginBtn = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginBtn);
    });

    // Test MIDI form inputs
    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText('Enter song title');
      const themeInput = screen.getByPlaceholderText('Enter theme or mood');
      
      fireEvent.change(titleInput, { target: { value: 'Test Song' } });
      fireEvent.change(themeInput, { target: { value: 'Upbeat' } });

      expect(titleInput.value).toBe('Test Song');
      expect(themeInput.value).toBe('Upbeat');
    });

    // Test genre dropdown
    const genreSelect = screen.getByDisplayValue('Pop');
    fireEvent.change(genreSelect, { target: { value: 'rock' } });
    expect(genreSelect.value).toBe('rock');

    // Test tempo and duration sliders
    const tempoSlider = screen.getByDisplayValue('120');
    fireEvent.change(tempoSlider, { target: { value: '140' } });
    expect(tempoSlider.value).toBe('140');
  });

  test('Responsive design and mobile layout', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'online', version: '1.0.0', environment: 'test', message: 'OK' })
    });

    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<App />);

    // Landing page should have responsive classes
    expect(screen.getByText('Burnt Beats')).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl', 'lg:text-7xl');
    
    // Pricing grid should be responsive
    const pricingSection = screen.getByText('Simple Pricing').closest('div');
    expect(pricingSection).toBeInTheDocument();
  });
});
