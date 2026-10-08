/**
 * pieces.js
 * Crisp Staunton chess piece vector SVGs (Standard C.Burnett chess SVGs).
 * Zero external font or image dependencies.
 */

const ChessPieces = {
    svgs: {
        'w_k': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="none" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
                <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#f8fafc" stroke-linecap="butt" stroke-linejoin="miter"/>
                <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z" fill="#f8fafc"/>
                <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/>
            </g>
        </svg>`,
        'w_q': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="#f8fafc" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM12.5 18a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm24 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
                <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-15-2.5 15-2.5-15-6 15-7-11 2 12z" stroke-linecap="butt"/>
                <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 21 1 27 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/>
                <path d="M11 38.5a35 35 0 0 0 23 0" fill="none" stroke-linecap="butt"/>
                <path d="M11 29a35 35 0 0 0 23 0M12.5 31.5h20M11.5 34.5a35 35 0 0 0 22 0M10.5 37.5a35 35 0 0 0 24 0" fill="none"/>
            </g>
        </svg>`,
        'w_r': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="#f8fafc" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1-16.5h15l1 16.5H14zM9 15h27v-6h-4.5v3h-4v-3h-6v3h-4v-3H9v6z" stroke-linecap="butt"/>
                <path d="M12 36v-4.5m21 4.5v-4.5M14 15v1.5h17V15H14zm-3-6h23"/>
            </g>
        </svg>`,
        'w_b': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="none" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <g fill="#f8fafc" stroke-linecap="butt">
                    <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/>
                    <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
                    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
                </g>
                <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/>
            </g>
        </svg>`,
        'w_n': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="none" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#f8fafc"/>
                <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.64 1.42-2 1-1.396-.43-2.062-1.93-3-3-.453-.52-.39-1.27.5-2 1.5-1.22 4.67-.78 6-3 1.32-2.22 2.65-4.47 4.29-6.39 1.63-1.92 5.06-4.52 7.21-4.61v9z" fill="#f8fafc"/>
                <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#1c1917" stroke="#1c1917"/>
                <path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" fill="#1c1917" stroke="#1c1917" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)"/>
            </g>
        </svg>`,
        'w_p': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="#f8fafc" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.5 9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 1 1 0-7z"/>
                <path d="M22.5 16c-3 0-5 2-5 5.5 0 2.5 1.5 4 1.5 4s-4 3-4 6.5h15c0-3.5-4-6.5-4-6.5s1.5-1.5 1.5-4c0-3.5-2-5.5-5-5.5z"/>
                <path d="M11 36c4-1 19-1 23 0m-20 3c3-1 11-1 17 0"/>
            </g>
        </svg>`,

        'b_k': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="none" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
                <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#292524" stroke-linecap="butt" stroke-linejoin="miter"/>
                <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V23.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7z" fill="#292524"/>
                <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#f8fafc"/>
            </g>
        </svg>`,
        'b_q': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="#292524" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm16.5 4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM12.5 18a2 2 0 1 1-4 0 2 2 0 1 1 4 0zm24 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/>
                <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-15-2.5 15-2.5-15-6 15-7-11 2 12z" stroke-linecap="butt"/>
                <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 21 1 27 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/>
                <path d="M11 38.5a35 35 0 0 0 23 0" fill="none" stroke="#f8fafc" stroke-linecap="butt"/>
                <path d="M11 29a35 35 0 0 0 23 0M12.5 31.5h20M11.5 34.5a35 35 0 0 0 22 0M10.5 37.5a35 35 0 0 0 24 0" fill="none" stroke="#f8fafc"/>
            </g>
        </svg>`,
        'b_r': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="#292524" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2-4.5l1-16.5h15l1 16.5H14zM9 15h27v-6h-4.5v3h-4v-3h-6v3h-4v-3H9v6z" stroke-linecap="butt"/>
                <path d="M12 36v-4.5m21 4.5v-4.5M14 15v1.5h17V15H14zm-3-6h23" stroke="#f8fafc"/>
            </g>
        </svg>`,
        'b_b': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="none" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <g fill="#292524" stroke-linecap="butt">
                    <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/>
                    <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
                    <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/>
                </g>
                <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#f8fafc"/>
            </g>
        </svg>`,
        'b_n': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="none" fill-rule="evenodd" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#292524"/>
                <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.64 1.42-2 1-1.396-.43-2.062-1.93-3-3-.453-.52-.39-1.27.5-2 1.5-1.22 4.67-.78 6-3 1.32-2.22 2.65-4.47 4.29-6.39 1.63-1.92 5.06-4.52 7.21-4.61v9z" fill="#292524"/>
                <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#f8fafc" stroke="#f8fafc"/>
                <path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" fill="#f8fafc" stroke="#f8fafc" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)"/>
            </g>
        </svg>`,
        'b_p': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%">
            <g fill="#292524" stroke="#1c1917" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22.5 9a3.5 3.5 0 1 1 0 7 3.5 3.5 0 1 1 0-7z"/>
                <path d="M22.5 16c-3 0-5 2-5 5.5 0 2.5 1.5 4 1.5 4s-4 3-4 6.5h15c0-3.5-4-6.5-4-6.5s1.5-1.5 1.5-4c0-3.5-2-5.5-5-5.5z"/>
                <path d="M11 36c4-1 19-1 23 0m-20 3c3-1 11-1 17 0" stroke="#f8fafc"/>
            </g>
        </svg>`
    },

    getSvg(type, color) {
        const key = `${color}_${type}`;
        return this.svgs[key] || '';
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessPieces;
}
