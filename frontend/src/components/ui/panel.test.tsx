import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Panel, PanelHeader, PanelBody } from './panel';

describe('Panel', () => {
  it('renders children', () => {
    render(<Panel>Panel Content</Panel>);
    expect(screen.getByText('Panel Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Panel className="custom-class">Content</Panel>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('custom-class');
  });
});

describe('PanelHeader', () => {
  it('renders children', () => {
    render(<PanelHeader>Header Content</PanelHeader>);
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });
});

describe('PanelBody', () => {
  it('renders children', () => {
    render(<PanelBody>Body Content</PanelBody>);
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });
});
