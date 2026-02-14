import { render, screen } from '@testing-library/react';

jest.mock('firebase/compat/app', () => {
  const firestoreMock = {
    collection: jest.fn(),
    doc: jest.fn(),
  };
  const storageMock = {
    ref: jest.fn(() => ({
      put: jest.fn().mockResolvedValue({}),
      getDownloadURL: jest.fn().mockResolvedValue('https://example.com/file.txt'),
      delete: jest.fn().mockResolvedValue({}),
    })),
  };
  const app = {
    initializeApp: jest.fn(() => ({
      firestore: () => firestoreMock,
    })),
    firestore: () => firestoreMock,
    storage: () => storageMock,
  };
  return { __esModule: true, default: app };
});
jest.mock('firebase/compat/firestore', () => {});
jest.mock('firebase/compat/storage', () => {});
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  setDoc: jest.fn(),
}));

import App from './App';

test('renders textarea for clipboard data', () => {
  render(<App />);
  const textarea = screen.getByRole('textbox');
  expect(textarea).toBeInTheDocument();
});

test('renders shared files section', () => {
  render(<App />);
  const heading = screen.getByText(/shared files/i);
  expect(heading).toBeInTheDocument();
});

test('renders upload button', () => {
  render(<App />);
  const uploadBtn = screen.getByText(/upload file/i);
  expect(uploadBtn).toBeInTheDocument();
});

test('renders file input element', () => {
  render(<App />);
  const fileInput = screen.getByTestId('file-input');
  expect(fileInput).toBeInTheDocument();
  expect(fileInput).toHaveAttribute('type', 'file');
  expect(fileInput).toHaveAttribute('multiple');
});

test('shows no files message when file list is empty', () => {
  render(<App />);
  const noFilesMsg = screen.getByText(/no files shared yet/i);
  expect(noFilesMsg).toBeInTheDocument();
});
