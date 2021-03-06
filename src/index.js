'use strict';

const activeClass = "active";

const Selectors = {
    myChatButton: "#_roomListContainer > div > button",
    createChatButton: "#_createChatRoomMenuButton > button",
    roomListArea: "#_roomListArea",
    sidebarPane: ".sidebarPane",
    roomsListContainer: "#_roomListContainer",
    roomFilterDropdown: "#_roomListContainer > div > div > div > div",
    roomFilterDropdownList: "#_roomListContainer > div > div > div > div.fade > div > ul",
    buttonContainer: `.sidebarPane > .exoego_buttons`,
    activeButton: `.exoego_buttons > button.${activeClass}`,
    buttonForCategories: `.exoego_buttons > button.category`,
    roomsSwitch: "#sidebarSwitch > div > button._showDescription:nth-of-type(1)",
    bookmarksSwitch: "#sidebarSwitch > div > button._showDescription:nth-of-type(2)",
    roomItems: "#RoomList > ul > li",
    categoryButtons: "#_roomListContainer > div > div > div > div.fade > div > ul> li:nth-child(10)",
};

const buttonsProp = (Locale) => [
    {"label": '<svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true"><use fill-rule="evenodd" xlink:href="#icon_home"></use></svg>', "selector": Selectors.myChatButton, "active": false},
    {"label": '<svg viewBox="0 0 10 10" width="16" height="16" aria-hidden="true"><use fill-rule="evenodd" xlink:href="#icon_plus"></use></svg>', "selector": Selectors.createChatButton, "active": false},
    {"label": Locale.all, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(1)`, "active": true},
    {"label": Locale.unread, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(2)`},
    {"label": Locale.mentioned, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(3)`},
    {"label": Locale.task, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(4)`},
    {"label": Locale.draft, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(5)`},
    {"label": Locale.direct, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(8)`},
    {"label": Locale.group, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(9)`},
    {"label": Locale.muted, "selector": `${Selectors.roomFilterDropdownList} > li:nth-child(10)`},
];

const countingButtons = [2, 3, 4, 5].map(index => {
    const gap = 2; // myChat, createChat
    return {
        "origin": `${Selectors.roomFilterDropdownList} > li:nth-child(${index}) > span`,
        "button": `${Selectors.buttonContainer} > button:nth-child(${index + gap})`,
    }
});

const createButton = (prop) => {
    const button = document.createElement("button");
    button.innerHTML = prop.label;
    if (prop.active === true) {
        button.classList.add(activeClass);
    }
    button.addEventListener("click", (event) => {
        event.preventDefault();
        const filter = document.querySelector(prop.selector);
        filter.click();
        document.querySelector(Selectors.activeButton)?.classList.remove(activeClass);
        if (prop.active !== false) {
            button.classList.add(activeClass);
        }
    });
    return button;
}

const init = (Locale) => {
    const style = document.createElement("style");
    // language=css
    style.innerText = `
        ${Selectors.roomsListContainer} {
            display: none;
        }

        #_wrapper > div:last-of-type[style="z-index: 1001; top: 0px; left: 0px;"] {
            top: 125px !important;
            left: 30px !important;
        }

        .exoego_buttons {
            margin: 5px 0;
        }

        .exoego_buttons button {
            background: transparent;
            border: 0;
            padding: 2px 4px;
            margin: 0 2px;
            border-radius: 4px;
            cursor: pointer;
        }

        .exoego_buttons button[data-count]::after {
            content: "(" attr(data-count) ")"
        }

        .exoego_buttons button[data-count="0"]::after {
            content: ""
        }

        .light .exoego_buttons button {
            color: #2A477F;
        }

        .light .exoego_buttons button svg {
            fill: #2A477F;
        }

        .light .exoego_buttons button.${activeClass} {
            background: #2E5190;
            color: #fff;
            font-weight: bold;
        }
        
        .dark .exoego_buttons button {
            color: #eee;
        }

        .dark .exoego_buttons button svg {
            fill: #fff;
        }

        .dark .exoego_buttons button.${activeClass} {
            background: #2E5190;
            color: #fff;
            font-weight: bold;
        }
    `
    document.head.append(style);
    const nonCategories = buttonsProp(Locale).map(createButton);
    const buttons = nonCategories;
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "exoego_buttons"
    buttonContainer.append(...buttons);

    function renderQuickFilter(element) {
        // keep rooms dropdown open
        document.querySelector(Selectors.roomFilterDropdown).click();
        element.before(buttonContainer);
    }

    const roomsSwitch = document.querySelector(Selectors.roomsSwitch)
    roomsSwitch.addEventListener("click", () => {
        const ct = setInterval(() => {
            let element = document.querySelector(Selectors.roomListArea);
            if (element) {
                clearInterval(ct)
                renderQuickFilter(element)
            }
        }, 30);
    })

    const bookmarkSwitch = document.querySelector(Selectors.bookmarksSwitch)
    bookmarkSwitch.addEventListener("click", () => {
        buttonContainer.remove()
    })

    renderQuickFilter(document.querySelector(Selectors.roomListArea))
    updatePaneHeight(buttonContainer);
}

function updatePaneHeight(buttonContainer) {
    const height = buttonContainer.scrollHeight + 10;
    document.querySelector(Selectors.sidebarPane).style = `
      height: calc(100% - ${height}px);
    `
}

const getLocale = (LANGUAGE) => {
    switch (LANGUAGE) {
        case "ja":
            return {
                "all": "?????????",
                "unread": "??????",
                "mentioned": "To",
                "task": "?????????",
                "draft": "?????????",
                "direct": "???????????????",
                "group": "????????????",
                "muted": "????????????",
            };
        default:
            return {
                "all": "All",
                "unread": "Unread",
                "mentioned": "To",
                "task": "Task",
                "draft": "Draft",
                "direct": "DM",
                "group": "Group",
                "muted": "Muted",
            };
    }
}

const cancelToken = setInterval(() => {
    if (document.querySelector(Selectors.roomListArea)) {
        // Detect language from button label, since script can not access window.LANGUAGe
        const label = document.querySelector(Selectors.myChatButton).getAttribute("aria-label")
        const language = label === "???????????????????????????" ? "ja" : "en";
        const Locale = getLocale(language);
        init(Locale);
        clearInterval(cancelToken);
    }
}, 50);

setInterval(() => {
    const buttonContainer = document.querySelector(Selectors.buttonContainer);
    updatePaneHeight(buttonContainer);
    countingButtons.forEach(props => {
        const o = document.querySelector(props.origin);
        const count = o?.innerText?.match(/\d+/)[0] ?? "0";
        document.querySelector(props.button).dataset.count = count;
    });

    const unreadDirectChats = Array
        .from(document.querySelectorAll(Selectors.roomItems))
        .filter(element => {
            const unreadBadge = element.querySelector("._unreadBadge")
            if (unreadBadge === null) {
                return false
            }
            const chatIcon = element.querySelector("img")
            return chatIcon?.src?.includes("avatar")
        });
    document.querySelector(`${Selectors.buttonContainer} > button:nth-child(8)`).dataset.count = String(unreadDirectChats.length)
}, 3000);
