import '@testing-library/jest-dom'
import { vi } from 'vitest'
import 'fake-indexeddb/auto'

// Mock any browser APIs not available in JSDOM if needed
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))
