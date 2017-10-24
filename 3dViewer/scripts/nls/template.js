//Contents of nls/template.js
define('nls/template', {
    // root is mandatory.
    root: ({
        viewer: {

            terms: {
                narrower: "narrower concepts",
                activeNarrower: "including narrower concepts",
                broader: "broader concepts",
                activeBroader: "including broader concepts",
                related: "related concepts",
                activeRelated: "including related concepts",
                filter: "restricted to"
            },
            sidePanel: {
                title: "no title",
                description: '<table style="width:100%">' +
                    '<tr>' +
                        '<td>created: </td>' +
                        '<td>November 2014</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>by: </td>' +
                        '<td>GBA</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>compiled data from: </td>' +
                        '<td>MA 45 <br /> GBA <br /> Literaturdaten</td>' +
                    '</tr>' +
                    '<tr>' +
                        '<td>scale: </td>' +
                        '<td>1 : 50.000</td>' +
                    '</tr>' +
                '</table>'
            },
            footer: {
                owner: "GBA",
                actualYear: "&#169; " + new Date().getFullYear() + " GBA",
                contact: "Contact",
                accessConstraints: "Terms of use",
                disclaimer: "Disclaimer"
            },
            buttons: {
                btnClearFilter: "Clear"
            },
            mainPanel: {
                title: "no title",
                subtitle: "no subtitle"
            },
            messages: {
                waitMessage: "Please wait...",
                featuresTagged: "Geologic Features tagged with",
                pointsPartially: "(partially shown in the map)"
            }
        },
        widgets: {
            popup: {
                NLS_moreInfo: "More info",
                NLS_searching: "Searching",
                NLS_prevFeature: "Previous feature",
                NLS_nextFeature: "Next feature",
                NLS_close: "Close",
                NLS_prevMedia: "Previous media",
                NLS_nextMedia: "Next media",
                NLS_noInfo: "No information available",
                NLS_noAttach: "No attachments found",
                NLS_maximize: "Maximize",
                NLS_restore: "Restore",
                NLS_zoomTo: "Zoom to",
                NLS_pagingInfo: "(${index} of ${total})",
                NLS_attach: "Attachments"
            },
            boreholepopup: {
                NLS_searching: "Searching",
                NLS_close: "Close",
                NLS_maximize: "Maximize",
                NLS_minimize: "Minimize"
            },
            boreholetool: {
                title: "borehole tool"
            },
            home: {
                button: "Home",
                title: "Default extent"
            },
            more: {
                moreInfo: "More controls",
                moreButton: "&dArr;",
                lessInfo: "Hide controls",
                lessButton: "&uArr;"
            },
            border: {
                showBorder: "extrude",
                hideBorder: "hide border"
            },
            zoom: {
                zoomInTitle: 'Zoom in',
                zoomOutTitle: 'Zoom out'
            },
            northarrow: {
                east: 'x',
                north: 'y',
                altitude: 'z'
            },
            gridlayer: {
                east: 'longitude',
                north: 'latitude',
                altitude: 'elevation'
            }
        }
    }),
    "ar": 0,
    "da": 0,
    "de": 1,
    "es": 0,
    "fr": 0,
    "he": 0,
    "it": 0,
    "ja": 0,
    "ko": 0,
    "lt": 0,
    "nl": 0,
    "nb": 0,
    "pl": 0,
    "pt-br": 0,
    "pt-pt": 0,
    "ro": 0,
    "ru": 0,
    "sv": 0,
    "zh-cn": 0
});