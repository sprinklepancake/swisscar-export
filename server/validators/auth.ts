import validator from 'validator'

export const validateLoginInput = (data: { email: string, password: string }) => {
    const errors = []
    
    if (!validator.isEmail(data.email)) {
        errors.push('Invalid email format')
    }
    
    if (validator.isEmpty(data.password)) {
        errors.push('Password is required')
    }
    
    return {
        valid: errors.length === 0,
        errors
    }
}

export const validateRegisterInput = (data: { 
    name: string, 
    email: string, 
    password: string 
}) => {
    const errors = []
    
    if (validator.isEmpty(data.name)) {
        errors.push('Name is required')
    }
    
    if (!validator.isEmail(data.email)) {
        errors.push('Invalid email format')
    }
    
    if (!validator.isLength(data.password, { min: 8 })) {
        errors.push('Password must be at least 8 characters')
    }
    
    return {
        valid: errors.length === 0,
        errors
    }
}