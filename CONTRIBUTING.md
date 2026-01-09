# Contributing to 1PDF

Thank you for your interest in contributing to 1PDF! We welcome contributions from the community.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/mosaddiqdev/onepdf.git
   cd onepdf
   ```
3. **Install dependencies**
   ```bash
   bun install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```

2. **Start development server**
   ```bash
   bun run dev
   ```

3. **Open your browser**
   ```
   http://localhost:3000
   ```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Ensure all TypeScript types are properly defined

## Testing

- Test your changes locally before submitting
- Ensure the build passes: `bun run build`
- Test with various PDF files and sizes
- Verify PWA functionality works

## Submitting Changes

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Use the PR template
   - Provide a clear description
   - Link any related issues

## Commit Message Format

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## Issues

- Use issue templates when reporting bugs or requesting features
- Provide detailed information and steps to reproduce
- Include browser and device information for bugs

## Questions?

Feel free to open an issue for questions or join discussions in existing issues.

Thank you for contributing! 🎉