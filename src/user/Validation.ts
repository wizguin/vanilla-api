import { InvalidJoinError } from '../errors/Errors'
import Database from '../database/Database'

// Letters, numbers, spaces, at least one letter
const nameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9 ]*$/

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function validateName(name: string) {
    name = trim(name)

    if (name.length < 4 || name.length > 12) {
        throw new InvalidJoinError()
    }

    if (name.toLowerCase().startsWith('penguin')) {
        throw new InvalidJoinError()
    }

    if (!nameRegex.test(name)) {
        throw new InvalidJoinError()
    }

    name = toTitleCase(name)

    const user = await Database.user.findFirst({
        where: {
            username: name
        }
    })

    if (user !== null) {
        throw new InvalidJoinError()
    }

    return name
}

export function validateEmail(email: string) {
    email = trim(email)

    if (email.length > 60) {
        throw new InvalidJoinError()
    }

    if (!emailRegex.test(email)) {
        throw new InvalidJoinError()
    }

    return email
}

export function validatePassword(password: string) {
    if (password.length < 5 || password.length > 32) {
        throw new InvalidJoinError()
    }

    return password
}

export function validateColor(color: string) {
    const parsed = parseInt(color)

    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
        return parsed
    }

    return 1
}

function trim(str: string) {
    return str.trim().replace(/\s+/g, ' ')
}

function toTitleCase(str: string) {
    return str.replace(/\w\S*/g, (word: string) => (
        word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
    ))
}
