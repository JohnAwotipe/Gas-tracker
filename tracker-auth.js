/* =========================================================
   COOKING GAS TRACKER
   Firebase Account Connection
   ========================================================= */

(function () {
    "use strict";

    function waitForFirebaseAuth(callback, attempts = 0) {
        if (window.firebase && typeof firebase.auth === "function") {
            callback(firebase.auth());
            return;
        }

        if (attempts >= 50) {
            console.warn("Firebase Authentication could not be loaded.");
            return;
        }

        setTimeout(() => {
            waitForFirebaseAuth(callback, attempts + 1);
        }, 200);
    }

    waitForFirebaseAuth(function (auth) {

        auth.onAuthStateChanged(function (user) {

            if (user) {
                console.log("Cooking Gas Tracker account connected:", user.uid);

                window.CGT_CURRENT_USER = user;

                showAccountStatus(user);

            } else {
                console.log("No signed-in Cooking Gas Tracker account.");

                window.CGT_CURRENT_USER = null;

                showSignInNotice();
            }
        });

        /*
         * Replace the existing sendToWorker function so that
         * the Firebase UID is used as the user ID.
         *
         * The existing FCM token and timezone system remain intact.
         */
        const originalSendToWorker = window.sendToWorker;

        if (typeof originalSendToWorker === "function") {

            window.sendToWorker = async function (fcmToken) {

                const user = auth.currentUser;

                if (!user) {
                    throw new Error(
                        "Please sign in to your Cooking Gas Tracker account before enabling reminders."
                    );
                }

                if (!window.savedDates && typeof savedDates !== "undefined" && !savedDates) {
                    throw new Error(
                        "Save your refill and consumption dates first."
                    );
                }

                const consumptionInput =
                    document.getElementById("consumptionDate");

                const consumptionDate =
                    consumptionInput ? consumptionInput.value : "";

                if (!consumptionDate) {
                    throw new Error(
                        "Please save your consumption date first."
                    );
                }

                const timeZone =
                    typeof getDeviceTimeZone === "function"
                        ? getDeviceTimeZone()
                        : Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

                const payload = {
                    userId: user.uid,
                    fcmToken: fcmToken,
                    consumptionDate: consumptionDate,
                    timeZone: timeZone
                };

                console.log("Sending authenticated tracker registration:", {
                    userId: user.uid,
                    timeZone: timeZone,
                    consumptionDate: consumptionDate
                });

                const response = await fetch(
                    "https://gas-notifier.johnawotipe9.workers.dev/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    }
                );

                const responseText = await response.text();

                let result;

                try {
                    result = JSON.parse(responseText);
                } catch (e) {
                    result = {
                        message: responseText
                    };
                }

                console.log(
                    "Authenticated Worker response:",
                    response.status,
                    result
                );

                if (!response.ok || result.ok === false) {
                    throw new Error(
                        result.error ||
                        result.message ||
                        `Worker returned HTTP ${response.status}`
                    );
                }

                return result;
            };
        }
    });

    /* =========================================================
       ACCOUNT STATUS
       ========================================================= */

    function showAccountStatus(user) {

        if (document.getElementById("trackerAccountStatus")) {
            return;
        }

        const hero = document.querySelector(".page-hero");

        if (!hero) {
            return;
        }

        const box = document.createElement("div");

        box.id = "trackerAccountStatus";

        const name =
            user.displayName ||
            user.email ||
            "Your account";

        box.innerHTML = `
            <div class="tracker-account-icon">✓</div>

            <div class="tracker-account-text">
                <strong>Account connected</strong>
                <span>${escapeHtml(name)}</span>
            </div>

            <a href="account.html" class="tracker-account-link">
                My Account →
            </a>
        `;

        hero.appendChild(box);

        injectAccountStyles();
    }

    /* =========================================================
       SIGN-IN NOTICE
       ========================================================= */

    function showSignInNotice() {

        if (document.getElementById("trackerAccountStatus")) {
            return;
        }

        const hero = document.querySelector(".page-hero");

        if (!hero) {
            return;
        }

        const box = document.createElement("div");

        box.id = "trackerAccountStatus";

        box.innerHTML = `
            <div class="tracker-account-icon">👤</div>

            <div class="tracker-account-text">
                <strong>Sign in to save your tracker to your account</strong>
                <span>Your reminder settings can then stay connected to your account.</span>
            </div>

            <a href="login.html" class="tracker-account-link">
                Sign In →
            </a>
        `;

        hero.appendChild(box);

        injectAccountStyles();
    }

    /* =========================================================
       ESCAPE HTML
       ========================================================= */

    function escapeHtml(value) {

        return String(value || "").replace(
            /[&<>"']/g,
            function (character) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                }[character];

            }
        );
    }

    /* =========================================================
       STYLES
       ========================================================= */

    function injectAccountStyles() {

        if (document.getElementById("trackerAccountStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "trackerAccountStyles";

        style.textContent = `
            #trackerAccountStatus {
                position: relative;
                z-index: 5;

                display: flex;
                align-items: center;
                gap: 13px;

                margin-top: 22px;

                padding: 13px 15px;

                border-radius: 16px;

                background: rgba(255,255,255,.13);

                border: 1px solid rgba(255,255,255,.22);

                backdrop-filter: blur(10px);

                color: #fff;

                max-width: 720px;
            }

            .tracker-account-icon {
                width: 38px;
                height: 38px;

                flex: 0 0 38px;

                display: flex;
                align-items: center;
                justify-content: center;

                border-radius: 50%;

                background: rgba(255,255,255,.18);

                font-weight: 900;
            }

            .tracker-account-text {
                display: flex;
                flex-direction: column;

                min-width: 0;

                flex: 1;
            }

            .tracker-account-text strong {
                font-size: 13px;
                line-height: 1.3;
            }

            .tracker-account-text span {
                font-size: 12px;
                opacity: .82;

                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .tracker-account-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;

                padding: 9px 13px;

                border-radius: 10px;

                background: #fff;

                color: #6d28d9 !important;

                text-decoration: none !important;

                font-size: 12px;

                font-weight: 900;

                white-space: nowrap;
            }

            .tracker-account-link:hover {
                transform: translateY(-1px);
            }

            @media(max-width:650px) {

                #trackerAccountStatus {
                    align-items: flex-start;
                    flex-wrap: wrap;
                }

                .tracker-account-text {
                    min-width: calc(100% - 55px);
                }

                .tracker-account-link {
                    width: 100%;
                    margin-left: 51px;
                }
            }
        `;

        document.head.appendChild(style);
    }

})();
