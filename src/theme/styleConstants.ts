/**
 * Centralized Style Constants
 *
 * This file contains all reusable style values used throughout the application.
 * Modify values here to update styles globally across all screens.
 */

/**
 * Font Sizes
 * Based on Material Design 3 typography scale
 */
export const FONT_SIZES = {
  // Extra small text (captions, labels on charts)
  xs: 10,
  // Small text (secondary labels, helper text)
  sm: 12,
  // Medium text (body text, standard labels)
  md: 14,
  // Large text (emphasized body text)
  lg: 16,
  // Extra large text (headings)
  xl: 18,
} as const;

/**
 * Border Radius
 * Consistent rounding for UI elements
 */
export const BORDER_RADIUS = {
  // Small elements (chips, small buttons)
  small: 4,
  // Medium elements (inputs, calendar dates)
  medium: 8,
  // Standard elements (buttons)
  standard: 12,
  // Cards and containers
  card: 16,
  // Large containers
  large: 20,
  // Circular elements
  round: 999,
} as const;

/**
 * Spacing
 * Consistent padding and margin values (8px base grid)
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Icon Sizes
 */
export const ICON_SIZES = {
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
} as const;

/**
 * Opacity Values
 */
export const OPACITY = {
  disabled: 0.38,
  inactive: 0.6,
  hover: 0.8,
  pressed: 0.7,
} as const;

/**
 * Chart Specific Constants
 */
export const CHART = {
  // Line thickness for charts
  lineThickness: 3,
  // Data point radius
  dataPointRadius: 4,
  // Pie chart radii
  pieRadius: 80,
  pieInnerRadius: 60,
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
