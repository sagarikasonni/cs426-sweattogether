
# SweatTogether UI/UX Design and Style Guidelines

### 1. Color Scheme

SweatTogether follows a greyscale color scheme, using Tailwind CSS colors for consistency and accessibility.

**Primary Colors:** 
-   `white` (Background color)
-   `gray-100` (Secondary background color, text color on dark backgrounds)
-   `gray-500` (Accent color, used on buttons)
-   `gray-700` (Primary text color)
-   `gray-800` (Dark accent color)

### 2. Typography

SweatTogether uses a sans-serif UI font stack that ensures platform consistency in line with the recommendations from [Apple’s Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/typography#Using-system-fonts):

 **Primary Font:** UI Sans Serif
-   macOS: `San Francisco`
-   Windows: `Segoe UI`
-   Android: `Roboto`

### 3. Spacing & Layout

-   Tailwind’s spacing scale (`p-4`, `m-2`, etc.) is used for for consistent padding and margins.
-   Flexbox ensure adaptability across screen sizes.

## Accessibility Standards

SweatTogether follows **WCAG 2.1 AA** compliance wherever applicable:
-   Ensure sufficient contrast ratios (`gray-700` text on `white` backgrounds) by pairing contrasting tones as outlined in [Google’s Material Design guidelines](https://m3.material.io/styles/color/system/how-the-system-works).
-   Provide alternative text for images and icons.

## Responsive Design

Components are responsive and adapt across different screen sizes:
-   `sm`, `md`, `lg`, `xl` breakpoints are used to adapt elements to mobile screens.
-   Flexboxes and wrapping allow for responsive layouts.
-   Responsive buttons and input fields are given minimum dimensions to ensure they are large enough to tap even on small devices.
