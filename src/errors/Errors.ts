import { buildError } from '../response/Response'

class ErrorCode extends Error {

    code: number
    response: string

    constructor(message: string, code: number) {
        super(message)

        this.code = code
        this.response = buildError(code)
    }

}

function createError(message: string, code: number) {
    return class extends ErrorCode {

        constructor() {
            super(message, code)
        }

    }
}

export const UserNotFoundError = createError('User not found', 100)
export const IncorrectPasswordError = createError('Incorrect password', 101)
export const InvalidJoinError = createError('Invalid join', 700)
