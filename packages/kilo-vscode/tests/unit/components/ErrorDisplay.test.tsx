import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent } from "@solidjs/testing-library"
import { ErrorDisplay } from "@/components/chat/ErrorDisplay"
import { createContext } from "@/context/language"

// Mock language context
const mockLanguage = {
  t: (key: string, params?: any) => {
    const translations: Record<string, string> = {
      "error.details.show": "Show details",
      "error.details.hide": "Hide details",
      "error.auth.required": "Authentication required",
      "error.auth.login": "Login",
      "error.auth.paid_model": "This model requires a paid subscription",
      "error.auth.promotion_limit": "You've reached the free usage limit",
      "error.auth.upgrade": "Upgrade"
    }
    return translations[key] || key
  },
  current: () => "en"
}

describe("ErrorDisplay Component", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderComponent = (error: any, onLogin = vi.fn()) => {
    const LanguageContext = createContext(mockLanguage)

    return render(() => (
      <LanguageContext.Provider>
        <ErrorDisplay error={error} onLogin={onLogin} />
      </LanguageContext.Provider>
    ))
  }

  describe("Basic Error Display", () => {
    it("should render error message", () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error message",
        data: { message: "Detailed error message" }
      }

      renderComponent(error)

      expect(screen.getByText("Detailed error message")).toBeInTheDocument()
      expect(screen.getByText("Show details")).toBeInTheDocument()
    })

    it("should render error without message", () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error message"
      }

      renderComponent(error)

      expect(screen.getByRole("alert")).toBeInTheDocument()
    })

    it("should handle null/undefined message", () => {
      const error = {
        code: "ERROR_CODE",
        data: { message: null }
      }

      renderComponent(error)

      expect(screen.getByRole("alert")).toBeInTheDocument()
    })

    it("should handle string message in data", () => {
      const error = {
        code: "ERROR_CODE",
        data: { message: "String error message" }
      }

      renderComponent(error)

      expect(screen.getByText("String error message")).toBeInTheDocument()
    })

    it("should handle object message in data", () => {
      const error = {
        code: "ERROR_CODE",
        data: { message: { detail: "Object error message" } }
      }

      renderComponent(error)

      expect(screen.getByText("[object Object]")).toBeInTheDocument()
    })
  })

  describe("Error Details Collapsible", () => {
    it("should show details when clicked", async () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error",
        data: { message: "Detailed error" }
      }

      renderComponent(error)

      const trigger = screen.getByText("Show details")
      await fireEvent.click(trigger)

      expect(screen.getByText("Hide details")).toBeInTheDocument()
    })

    it("should hide details when clicked again", async () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error",
        data: { message: "Detailed error" }
      }

      renderComponent(error)

      const trigger = screen.getByText("Show details")
      await fireEvent.click(trigger)
      await fireEvent.click(screen.getByText("Hide details"))

      expect(screen.getByText("Show details")).toBeInTheDocument()
    })

    it("should toggle details with keyboard", async () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error",
        data: { message: "Detailed error" }
      }

      renderComponent(error)

      const trigger = screen.getByText("Show details")
      trigger.focus()
      
      await fireEvent.keyDown(trigger, { key: "Enter" })
      expect(screen.getByText("Hide details")).toBeInTheDocument()

      await fireEvent.keyDown(trigger, { key: "Enter" })
      expect(screen.getByText("Show details")).toBeInTheDocument()
    })
  })

  describe("Authentication Errors", () => {
    it("should show paid model error", () => {
      const error = {
        code: "UNAUTHORIZED_PAID_MODEL",
        message: "Paid model required",
        data: { message: "This model requires payment" }
      }

      renderComponent(error)

      expect(screen.getByText("Authentication required")).toBeInTheDocument()
      expect(screen.getByText("This model requires a paid subscription")).toBeInTheDocument()
      expect(screen.getByText("Login")).toBeInTheDocument()
    })

    it("should show promotion limit error", () => {
      const error = {
        code: "UNAUTHORIZED_PROMOTION_LIMIT",
        message: "Promotion limit reached",
        data: { message: "Free usage limit exceeded" }
      }

      renderComponent(error)

      expect(screen.getByText("Authentication required")).toBeInTheDocument()
      expect(screen.getByText("You've reached the free usage limit")).toBeInTheDocument()
      expect(screen.getByText("Upgrade")).toBeInTheDocument()
    })

    it("should call onLogin when login button is clicked", async () => {
      const onLogin = vi.fn()
      const error = {
        code: "UNAUTHORIZED_PAID_MODEL",
        message: "Paid model required",
        data: { message: "This model requires payment" }
      }

      renderComponent(error, onLogin)

      const loginButton = screen.getByText("Login")
      await fireEvent.click(loginButton)

      expect(onLogin).toHaveBeenCalled()
    })

    it("should call onLogin when upgrade button is clicked", async () => {
      const onLogin = vi.fn()
      const error = {
        code: "UNAUTHORIZED_PROMOTION_LIMIT",
        message: "Promotion limit reached",
        data: { message: "Free usage limit exceeded" }
      }

      renderComponent(error, onLogin)

      const upgradeButton = screen.getByText("Upgrade")
      await fireEvent.click(upgradeButton)

      expect(onLogin).toHaveBeenCalled()
    })
  })

  describe("Error Types", () => {
    it("should handle network errors", () => {
      const error = {
        code: "NETWORK_ERROR",
        message: "Network connection failed",
        data: { message: "Unable to connect to server" }
      }

      renderComponent(error)

      expect(screen.getByText("Unable to connect to server")).toBeInTheDocument()
    })

    it("should handle validation errors", () => {
      const error = {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        data: { message: "Input validation failed" }
      }

      renderComponent(error)

      expect(screen.getByText("Input validation failed")).toBeInTheDocument()
    })

    it("should handle timeout errors", () => {
      const error = {
        code: "TIMEOUT_ERROR",
        message: "Request timeout",
        data: { message: "Operation timed out after 30 seconds" }
      }

      renderComponent(error)

      expect(screen.getByText("Operation timed out after 30 seconds")).toBeInTheDocument()
    })

    it("should handle unknown errors", () => {
      const error = {
        code: "UNKNOWN_ERROR",
        message: "An unknown error occurred",
        data: { message: "Unexpected error" }
      }

      renderComponent(error)

      expect(screen.getByText("Unexpected error")).toBeInTheDocument()
    })
  })

  describe("Error Message Parsing", () => {
    it("should handle complex error messages", () => {
      const error = {
        code: "COMPLEX_ERROR",
        message: "Complex error occurred",
        data: {
          message: "Error with nested data",
          details: {
            field: "username",
            reason: "Invalid format"
          }
        }
      }

      renderComponent(error)

      expect(screen.getByText("Error with nested data")).toBeInTheDocument()
    })

    it("should handle empty error data", () => {
      const error = {
        code: "EMPTY_ERROR",
        message: "Empty error",
        data: {}
      }

      renderComponent(error)

      expect(screen.getByRole("alert")).toBeInTheDocument()
    })

    it("should handle missing data property", () => {
      const error = {
        code: "NO_DATA_ERROR",
        message: "No data error"
      }

      renderComponent(error)

      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have proper ARIA roles", () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error",
        data: { message: "Test error message" }
      }

      renderComponent(error)

      expect(screen.getByRole("alert")).toBeInTheDocument()
    })

    it("should support keyboard navigation", async () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error",
        data: { message: "Test error message" }
      }

      renderComponent(error)

      const detailsTrigger = screen.getByText("Show details")
      detailsTrigger.focus()

      expect(detailsTrigger).toHaveFocus()
    })

    it("should announce error to screen readers", () => {
      const error = {
        code: "ERROR_CODE",
        message: "Test error",
        data: { message: "Important error message" }
      }

      renderComponent(error)

      expect(screen.getByRole("alert")).toBeInTheDocument()
    })
  })

  describe("Edge Cases", () => {
    it("should handle very long error messages", () => {
      const longMessage = "A".repeat(10000)
      const error = {
        code: "LONG_ERROR",
        message: "Long error",
        data: { message: longMessage }
      }

      renderComponent(error)

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it("should handle error messages with special characters", () => {
      const error = {
        code: "SPECIAL_CHARS_ERROR",
        message: "Special chars error",
        data: { message: "Error with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?" }
      }

      renderComponent(error)

      expect(screen.getByText(/Error with special chars:/)).toBeInTheDocument()
    })

    it("should handle error messages with HTML entities", () => {
      const error = {
        code: "HTML_ENTITIES_ERROR",
        message: "HTML entities error",
        data: { message: "Error with HTML: &lt;script&gt;alert('xss')&lt;/script&gt;" }
      }

      renderComponent(error)

      // Should escape HTML entities
      expect(screen.getByText(/Error with HTML:/)).toBeInTheDocument()
    })

    it("should handle error messages with Unicode", () => {
      const error = {
        code: "UNICODE_ERROR",
        message: "Unicode error",
        data: { message: "Error with Unicode: 🚀 🔥 💯 🎉" }
      }

      renderComponent(error)

      expect(screen.getByText(/Error with Unicode:/)).toBeInTheDocument()
    })
  })

  describe("Component Lifecycle", () => {
    it("should handle error prop changes", async () => {
      const initialError = {
        code: "INITIAL_ERROR",
        message: "Initial error",
        data: { message: "Initial error message" }
      }

      const { rerender } = renderComponent(initialError)

      expect(screen.getByText("Initial error message")).toBeInTheDocument()

      const updatedError = {
        code: "UPDATED_ERROR",
        message: "Updated error",
        data: { message: "Updated error message" }
      }

      rerender(() => (
        <ErrorDisplay error={updatedError} onLogin={vi.fn()} />
      ))

      expect(screen.getByText("Updated error message")).toBeInTheDocument()
    })

    it("should handle onLogin prop changes", async () => {
      const error = {
        code: "UNAUTHORIZED_PAID_MODEL",
        message: "Paid model required",
        data: { message: "This model requires payment" }
      }

      const onLogin1 = vi.fn()
      const { rerender } = renderComponent(error, onLogin1)

      const loginButton = screen.getByText("Login")
      await fireEvent.click(loginButton)

      expect(onLogin1).toHaveBeenCalled()

      const onLogin2 = vi.fn()
      rerender(() => (
        <ErrorDisplay error={error} onLogin={onLogin2} />
      ))

      await fireEvent.click(loginButton)
      expect(onLogin2).toHaveBeenCalled()
    })
  })
})
