//Contents of nls/de/template.js
define({
    viewer: {      
        terms: {
            narrower: "untergeordnete Begriffe",
            activeNarrower: "inkl. untergeordnete Begriffe",
            broader: "übergeordnete Begriffe",
            activeBroader: "inkl. übergeordnete Begriffe",
            related: "verwandte Begriffe",
            activeRelated: "inkl. verwandte Begriffe",
            filter: "eingeschränkt auf"
        },
        sidePanel: {
            title: "kein Titel",
            description: '<table style="width:100%">' + 
              '<tr>' +
                '<td>erstellt im: </td>' +
                '<td>November 2014</td>' +         
              '</tr>' +
            '<tr>' +
                '<td>von: </td>' +
                '<td>GBA</td>' +
            '</tr>' +
             '<tr>' +
                '<td>aus: </td>' +
                '<td>Daten der MA 45 <br /> Daten der GBA <br /> Literaturdaten</td>' +
            '</tr>' +
            '<tr>' +
                '<td>im Maßstab: </td>' +
                '<td>1 : 50.000</td>' +
            '</tr>' +
        '</table>'        
        },
        footer: {
            owner: "GBA",
            actualYear: "&#169; " + new Date().getFullYear() + " GBA",
            contact: "Kontakt",
            accessConstraints: "Nutzungsbedingungen",
            disclaimer: "Haftungsausschluss"
        },
        buttons: {
            btnClearFilter: "Löschen"
        },
        mainPanel: {
            title: "kein Titel",
            subtitle: "kein Untertitel"
        },
        messages: {
            waitMessage: "Bitte warten...",
            featuresTagged: "Einheiten im Zusammenhang mit",
            pointsPartially: "(teilweise in der Karte dargestellt)"
        }
    },
    widgets: {
        popup: {
            NLS_moreInfo: "Weitere Informationen",
            NLS_searching: "Suchen",
            NLS_prevFeature: "Vorheriges Feature",
            NLS_nextFeature: "N\u00e4chstes Feature",
            NLS_close: "Schlie\u00dfen",
            NLS_prevMedia: "Vorheriges Medium",
            NLS_nextMedia: "N\u00e4chstes Medium",
            NLS_noInfo: "Keine Informationen verf\u00fcgbar",
            NLS_noAttach: "Keine Anlagen gefunden",
            NLS_maximize: "Maximieren",
            NLS_restore: "Wiederherstellen",
            NLS_zoomTo: "Zoomen auf",
            NLS_pagingInfo: "(${index} von ${total})",
            NLS_attach: "Anlagen"
        },
        boreholepopup: {
            NLS_searching: "Suchen",
            NLS_close: "Schlie\u00dfen",
            NLS_maximize: "Seitliches Steuerfeld einblenden",
            NLS_minimize: "Seitliches Steuerfeld ausblenden"
        },
        boreholetool: {
            title: "Bohrung"
        },
        home: {
            "button": "Home",
            "title": "Standardausdehnung"
        },
        more: {
            moreInfo: "Mehrere Controls",
            moreButton: "&dArr;",
            lessInfo: "Weniger Controls",
            lessButton: "&uArr;"
        },
        border: {
            showBorder: "extrudieren",           
            hideBorder: "Grenzgeometrie verstecken"            
        },
        zoom: {
            zoomInTitle: 'Vergrößern',
            zoomOutTitle: 'Verkleinern '
        }
    }
});