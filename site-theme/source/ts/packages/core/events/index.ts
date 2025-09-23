const domReady = (resolve: () => void) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
        setTimeout(() => resolve(), 0); // yield to event loop
    }
};

const windowLoad = (resolve: () => void) => {
    if (document.readyState === 'complete') {
        setTimeout(() => resolve(), 0); // yield to event loop
    } else {
        window.addEventListener('load', () => resolve());
    }
};


const Events = {
    window: {
        onLoad: windowLoad
    },
    document: {
        onReady: domReady
    }
}

export  { Events };