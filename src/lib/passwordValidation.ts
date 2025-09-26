export interface PasswordValidationResult {
  isValid: boolean
  score: number
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []
  let score = 0

  // Length validation
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  } else if (password.length >= 8) {
    score += 1
  }

  if (password.length >= 12) {
    score += 1
  }

  // Character type validation
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter")
  } else {
    score += 1
  }

  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter")
  } else {
    score += 1
  }

  if (!hasNumbers) {
    errors.push("Password must contain at least one number")
  } else {
    score += 1
  }

  if (!hasSpecialChars) {
    errors.push("Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;':\",./<>?)")
  } else {
    score += 1
  }

  // Common patterns and weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'dragon', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', '654321', 'jordan23', 'harley', 'password1234',
    'robert', 'matthew', 'jordan', 'asshole', 'daniel', 'andrew', 'charles',
    'michael', 'james', 'david', 'william', 'richard', 'joseph', 'thomas',
    'christopher', 'charles', 'daniel', 'matthew', 'anthony', 'mark',
    'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin',
    'brian', 'george', 'timothy', 'ronald', 'jason', 'edward', 'jeffrey',
    'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen',
    'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'gregory',
    'frank', 'raymond', 'alexander', 'patrick', 'jack', 'dennis', 'jerry',
    'tyler', 'aaron', 'jose', 'henry', 'douglas', 'adam', 'peter', 'nathan',
    'zachary', 'kyle', 'walter', 'harold', 'carl', 'jeremy', 'arthur',
    'lawrence', 'sean', 'christian', 'ethan', 'austin', 'joe', 'albert',
    'jesse', 'willie', 'billy', 'bryan', 'bruce', 'noah', 'jordan', 'dylan',
    'alan', 'ralph', 'gabriel', 'roy', 'juan', 'wayne', 'eugene', 'logan',
    'randy', 'louis', 'philip', 'bobby', 'johnny', 'bradley'
  ]

  const lowerPassword = password.toLowerCase()
  if (commonPasswords.includes(lowerPassword)) {
    errors.push("This password is too common and easily guessable")
    score = 0
  }

  // Sequential characters
  if (/(.)\1{2,}/.test(password)) {
    warnings.push("Avoid repeating the same character multiple times")
    score -= 1
  }

  // Sequential numbers or letters
  if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
    warnings.push("Avoid sequential characters (123, abc, etc.)")
    score -= 1
  }

  // Keyboard patterns
  const keyboardPatterns = [
    'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'qwertyuiopasdfghjklzxcvbnm', '1qaz2wsx', '1q2w3e4r', 'qazwsxedc'
  ]
  
  for (const pattern of keyboardPatterns) {
    if (lowerPassword.includes(pattern)) {
      warnings.push("Avoid common keyboard patterns")
      score -= 1
      break
    }
  }

  // Personal information patterns (basic check)
  if (password.length > 0) {
    // Check for common personal info patterns
    const personalPatterns = [
      /^\d{4}$/, // 4 digit years
      /^\d{6}$/, // 6 digit dates
      /^\d{8}$/, // 8 digit dates
    ]
    
    for (const pattern of personalPatterns) {
      if (pattern.test(password)) {
        warnings.push("Avoid using personal information like birth dates")
        score -= 1
        break
      }
    }
  }

  // Suggestions for improvement
  if (score < 3) {
    suggestions.push("Use a mix of uppercase and lowercase letters")
    suggestions.push("Include numbers and special characters")
    suggestions.push("Make it at least 12 characters long")
  }

  if (password.length < 12) {
    suggestions.push("Consider making your password longer for better security")
  }

  if (!hasSpecialChars) {
    suggestions.push("Add special characters like !@#$%^&* for extra security")
  }

  // Calculate final score (0-5)
  score = Math.max(0, Math.min(5, score))

  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    suggestions
  }
}

export const getPasswordStrength = (score: number): PasswordStrength => {
  if (score <= 1) {
    return { score, label: "Very Weak", color: "bg-red-500" }
  } else if (score === 2) {
    return { score, label: "Weak", color: "bg-orange-500" }
  } else if (score === 3) {
    return { score, label: "Fair", color: "bg-yellow-500" }
  } else if (score === 4) {
    return { score, label: "Good", color: "bg-blue-500" }
  } else {
    return { score, label: "Strong", color: "bg-green-500" }
  }
}

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 1) return "text-red-600"
  if (score === 2) return "text-orange-600"
  if (score === 3) return "text-yellow-600"
  if (score === 4) return "text-blue-600"
  return "text-green-600"
}
