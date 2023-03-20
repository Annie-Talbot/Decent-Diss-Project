import { login, getDefaultSession, handleIncomingRedirect, logout } from '@inrupt/solid-client-authn-browser'

/**
 * This function redirects the page to the solid provider given to log a user 
 * into their SOLID pod. If an errors occur, the handler will return a 
 * corresponding error message.
 *
 * @param {string} solidProvider The url of the Solid Pod Provider that 
 * holds the user's pod.
 * @param {string} appName the name of the app requesting access to the POD.
 */
export async function loginHandler(solidProvider, appName) {
    let errorMsg = '';
    if (!getDefaultSession().info.isLoggedIn) {
        try {
            await login({
                oidcIssuer: solidProvider,
                redirectUrl: window.location.href,
                clientName: appName
              });
        } catch (error) {
            const validUrl = /.*Invalid URL.*/;
            if (validUrl.test(solidProvider)) {
                errorMsg = "Invalid URL";
            } else {
                errorMsg = "Unknown error. Contact support.";
            }
            return {success: false, error: errorMsg};
        }
    } else {
        // User is already logged in
        errorMsg = "You're already logged in, click one of the options on " +
        "the sidebar to use the app.";
        return {success: true, error: errorMsg};
    }

    return {success: true};
}


export async function getSession() {
    await handleIncomingRedirect();
    let session = getDefaultSession().info;
    if (!session.isLoggedIn) {
        return {loggedIn: false};
    }
    return {loggedIn: true, webId: session.webId};
}

export async function logoutHandler() {
    await logout();
    return;
}