import Okane from '../lib';

describe('Okane::OFX', () => {
    it('should transform a basic ofx file header', () => {
        const ofxContent = 'OFXHEADER:100';

        const hash = {
            OFXHEADER: '100',
        };

        expect(Okane.parse(ofxContent)).toEqual(hash);
    });

    it('should parse a complete ofx file header', () => {
        const xml = `
            OFXHEADER:100
            DATA:OFXSGML
            VERSION:102
            SECURITY:NONE
            ENCODING:USASCII
            CHARSET:1252
            COMPRESSION:NONE
            OLDFILEUID:NONE
            NEWFILEUID:NONE
        `;

        const hash = {
            OFXHEADER: '100',
            DATA: 'OFXSGML',
            VERSION: '102',
            SECURITY: 'NONE',
            ENCODING: 'USASCII',
            CHARSET: '1252',
            COMPRESSION: 'NONE',
            OLDFILEUID: 'NONE',
            NEWFILEUID: 'NONE',
        };

        expect(Okane.parse(xml)).toEqual(hash);
    });

    it('should parse a complete ofx file header and an opening tag', () => {
        const xml = `
            OFXHEADER:100
            DATA:OFXSGML
            VERSION:102
            SECURITY:NONE
            ENCODING:USASCII
            CHARSET:1252
            COMPRESSION:NONE
            OLDFILEUID:NONE
            NEWFILEUID:NONE
            <OFX>
            <DTSERVER>20240413000000[-3:GMT]
            </OFX>
        `;

        const hash = {
            OFXHEADER: '100',
            DATA: 'OFXSGML',
            VERSION: '102',
            SECURITY: 'NONE',
            ENCODING: 'USASCII',
            CHARSET: '1252',
            COMPRESSION: 'NONE',
            OLDFILEUID: 'NONE',
            NEWFILEUID: 'NONE',
            OFX: {
                DTSERVER: '20240413000000[-3:GMT]',
            },
        };

        expect(Okane.parse(xml)).toEqual(hash);
    });

    it('should parse a complete ofx file header with more than one level deep', () => {
        const xml = `
            OFXHEADER:100
            <OFX>
                <SIGNONMSGSRSV1>
                    <SONRS>
                        <STATUS>
                            <CODE>0
                            <SEVERITY>INFO
                        </STATUS>
                        <DTSERVER>20240413000000[-3:GMT]
                        <LANGUAGE>POR
                    </SONRS>
                </SIGNONMSGSRSV1>
            </OFX>
        `;

        const hash = {
            OFXHEADER: '100',
            OFX: {
                SIGNONMSGSRSV1: {
                    SONRS: {
                        STATUS: {
                            CODE: '0',
                            SEVERITY: 'INFO',
                        },
                        DTSERVER: '20240413000000[-3:GMT]',
                        LANGUAGE: 'POR',
                    },
                },
            },
        };

        expect(Okane.parse(xml)).toEqual(hash);
    });

    it('should parse a complete ofx file header with an element with multiple children with the same tag', () => {
        const xml = `
            OFXHEADER:100
            <OFX>
                <CREDITCARDMSGSRSV1>
                    <CCSTMTTRNRS>
                        <CCSTMTRS>
                            <CURDEF>BRL
                            <BANKTRANLIST>
                                <DTSTART>20221230000000[-3:GMT]
                                <DTEND>20230130000000[-3:GMT]

                                <STMTTRN>
                                    <TRNTYPE>DEBIT
                                    <DTPOSTED>20230126000000[-3:GMT]
                                    <TRNAMT>-39.80
                                    <FITID>63d05e4b-2649-4732-b6d0-2f6e60cf83ee
                                    <MEMO>Mc Donalds - Arcos Dou
                                </STMTTRN>

                                <STMTTRN>
                                    <TRNTYPE>DEBIT
                                    <DTPOSTED>20230123000000[-3:GMT]
                                    <TRNAMT>-35.00
                                    <FITID>63cd46ff-cb85-4bef-b85b-31783996d136
                                    <MEMO>Receipt
                                </STMTTRN>

                            </BANKTRANLIST>
                        </CCSTMTRS>
                    </CCSTMTTRNRS>
                </CREDITCARDMSGSRSV1>
            </OFX>
        `;

        const hash = {
            OFXHEADER: '100',
            OFX: {
                CREDITCARDMSGSRSV1: {
                    CCSTMTTRNRS: {
                        CCSTMTRS: {
                            CURDEF: 'BRL',
                            BANKTRANLIST: {
                                DTSTART: '20221230000000[-3:GMT]',
                                DTEND: '20230130000000[-3:GMT]',
                                STMTTRN: [
                                    {
                                        TRNTYPE: 'DEBIT',
                                        DTPOSTED: '20230126000000[-3:GMT]',
                                        TRNAMT: '-39.80',
                                        FITID: '63d05e4b-2649-4732-b6d0-2f6e60cf83ee',
                                        MEMO: 'Mc Donalds - Arcos Dou',
                                    },
                                    {
                                        TRNTYPE: 'DEBIT',
                                        DTPOSTED: '20230123000000[-3:GMT]',
                                        TRNAMT: '-35.00',
                                        FITID: '63cd46ff-cb85-4bef-b85b-31783996d136',
                                        MEMO: 'Receipt',
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        };

        expect(Okane.parse(xml)).toEqual(hash);
    });

    it('should parse a complete ofx file header with an attribute tag that has a self-closing tag', () => {
        const xml = `
            OFXHEADER:100
            <OFX>
                <CREDITCARDMSGSRSV1>
                    <CCSTMTTRNRS>
                        <CCSTMTRS>
                            <CURDEF>BRL
                            <BANKTRANLIST>
                                <DTSTART>20221230000000[-3:GMT]
                                <DTEND>20230130000000[-3:GMT]

                                <STMTTRN>
                                    <TRNTYPE>DEBIT</TRNTYPE>
                                    <DTPOSTED>20230126000000[-3:GMT]</DTPOSTED>
                                    <TRNAMT>-39.80</TRNAMT>
                                    <FITID>63d05e4b-2649-4732-b6d0-2f6e60cf83ee</FITID>
                                    <MEMO>Mc Donalds - Arcos Dou</MEMO>
                                </STMTTRN>

                                <STMTTRN>
                                    <TRNTYPE>DEBIT</TRNTYPE>
                                    <DTPOSTED>20230123000000[-3:GMT]</DTPOSTED>
                                    <TRNAMT>-35.00</TRNAMT>
                                    <FITID>63cd46ff-cb85-4bef-b85b-31783996d136</FITID>
                                    <MEMO>Receipt</MEMO>
                                </STMTTRN>

                            </BANKTRANLIST>
                        </CCSTMTRS>
                    </CCSTMTTRNRS>
                </CREDITCARDMSGSRSV1>
            </OFX>
        `;

        const hash = {
            OFXHEADER: '100',
            OFX: {
                CREDITCARDMSGSRSV1: {
                    CCSTMTTRNRS: {
                        CCSTMTRS: {
                            CURDEF: 'BRL',
                            BANKTRANLIST: {
                                DTSTART: '20221230000000[-3:GMT]',
                                DTEND: '20230130000000[-3:GMT]',
                                STMTTRN: [
                                    {
                                        TRNTYPE: 'DEBIT',
                                        DTPOSTED: '20230126000000[-3:GMT]',
                                        TRNAMT: '-39.80',
                                        FITID: '63d05e4b-2649-4732-b6d0-2f6e60cf83ee',
                                        MEMO: 'Mc Donalds - Arcos Dou',
                                    },
                                    {
                                        TRNTYPE: 'DEBIT',
                                        DTPOSTED: '20230123000000[-3:GMT]',
                                        TRNAMT: '-35.00',
                                        FITID: '63cd46ff-cb85-4bef-b85b-31783996d136',
                                        MEMO: 'Receipt',
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        };

        expect(Okane.parse(xml)).toEqual(hash);
    });
});
