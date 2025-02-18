// utils/cookies.js
import Cookies from 'js-cookie'

export const getCookie = (name) => {
    const cookieStore = cookies()
    return cookieStore.get(name)?.value
}

export const setCookie = (name, value, options = {}) => {
    const cookieStore = cookies()
    cookieStore.set(name, value, options)
}
