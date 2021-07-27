'use strict';

const activeClass = "active";

const Selectors = {
    myChatButton: "#_roomListContainer > div > button",
    roomListArea: "#_roomListArea",
    sidebarPane: ".sidebarPane",
    roomFilterDropdown: "#_roomListContainer > div > div > div > div",
    roomFilterDropdownList: "#_roomListContainer > div > div > div > div.fade > div > ul",
    roomFilterDropdownListItems: "#_roomListContainer > div > div > div > div.fade > div > ul > li",
    newCategoryButton: `.exoego_buttons > button.${activeClass}`,

    buttonContainer: `.exoego_buttons`,
    activeButton: `.exoego_buttons > button.${activeClass}`,
    buttonForCategories: `.exoego_buttons > button.category`,
};

const buttonsProp = (Locale) => [
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
    return {
        "origin": `${Selectors.roomFilterDropdownList} > li:nth-child(${index}) > span`,
        "button": `${Selectors.buttonContainer} > button:nth-child(${index})`,
    }
});

const createButton = (prop) => {
    const button = document.createElement("button");
    button.innerText = prop.label;
    if (prop.active) {
        button.classList.add(activeClass);
    }
    button.addEventListener("click", (event) => {
        event.preventDefault();
        document.querySelector(Selectors.roomFilterDropdown).click();
        const ct = setInterval(() => {
            const filter = document.querySelector(prop.selector);
            if (filter) {
                filter.click();
                document.querySelector(Selectors.activeButton)?.classList.remove(activeClass);
                button.classList.add(activeClass);
                clearInterval(ct);
            }
        }, 10);
    });
    return button;
}

const init = (Locale) => {
    // keep open
    document.querySelector(Selectors.roomFilterDropdown).click();
    const style = document.createElement("style");
    // language=css
    style.innerText = `
        ${Selectors.roomFilterDropdown} {
            display: none;
        }

        .exoego_buttons button {
            background: transparent;
            border: 0;
            margin: 0 2px;
            border-radius: 4px;
        }

        .exoego_buttons button[data-count]::after {
            content: "(" attr(data-count) ")"
        }

        .exoego_buttons button[data-count="0"]::after {
            content: ""
        }

        .light .exoego_buttons button.${activeClass} {
            background: #2E5190;
            color: #fff;
            font-weight: bold;
        }

        .dark .exoego_buttons button {
            color: #eee;
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
    document.querySelector(Selectors.roomListArea).before(buttonContainer);
    const height = 49 + 25 + buttonContainer.scrollHeight;
    document.querySelector(Selectors.sidebarPane).style = `
      height: calc(100% - ${height}px);
    `
}

const getLocale = (LANGUAGE) => {
    switch (LANGUAGE) {
        case "ja":
            return {
                "all": "すべて",
                "unread": "未読",
                "mentioned": "To",
                "task": "タスク",
                "draft": "下書き",
                "direct": "ダイレクト",
                "group": "グループ",
                "muted": "ミュート",
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

const deleteCatButtons = () => {
    Array.from(document.querySelectorAll(Selectors.buttonForCategories)).forEach(e => {
        e.remove();
    });
}

const initCategoryButtons = () => {
    // update categories
    return Array
        .from(document.querySelectorAll(Selectors.roomFilterDropdownListItems))
        .flatMap((item, index) => {
            console.log(index, item)
            if (index > 7) {
                return [{index: index + 1, item}];
            } else {
                return [];
            }
        }).map(categoryItem => createButton({
            "label": categoryItem.item.innerText,
            "selector": `${Selectors.roomFilterDropdownList} > li:nth-of-type(${categoryItem.index})`,
        }));
};

const cancelToken = setInterval(() => {
    if (document.querySelector(Selectors.roomListArea)) {
        // Detect language from button label, since script can not access window.LANGUAGe
        const label = document.querySelector(Selectors.myChatButton).getAttribute("aria-label")
        const language = label === "マイチャットを表示" ? "ja" : "en";
        const Locale = getLocale(language);
        init(Locale);
        clearInterval(cancelToken);
    }
}, 50);


var catsInitialied = false;

setInterval(() => {
    if (!catsInitialied) {
        const categoryButtons = initCategoryButtons();
        document.querySelector(Selectors.buttonContainer).append(...categoryButtons);
        catsInitialied  = true;
    }

    // update counts
    countingButtons.forEach(props => {
        const o = document.querySelector(props.origin);
        const count = o?.innerText?.match(/\d+/)[0] ?? 0;
        document.querySelector(props.button).dataset.count = count;
    });
}, 5000);
