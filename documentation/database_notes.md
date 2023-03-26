# **Adatbázis tervek**

## **Felhasználó**
- ID
- Felhasználó név ( *LDAP* )
- Jelszó ( *LDAP* )
- Név ( *lehet azonos* )
- E-mail (*akár több is*)
- Rang / user role ( *user / admin ?* )

## **Dokumentum**
- ID
- Feltöltött fájl ( *elsősorban PDF* )
    - Fájl méret
    - Feltöltés időpontja
- Cím
- Szerző ( *több is* )
- Dátum
- Rövid leírás
- Azonosító ( *DOI* )
- Tag-ek ( *több is, előre nem megszabva* )
- Kapcsolódó dokumentumok
- Megjegyzés
    - Tartalom
    - Írás / szerkesztés időpontja
    - Láthatóság ( *privát / csapat / publikus* )
    - Felhasználó

## **Dokumentum kiemelés**
*Utánna kell nézni hogyan működhetne.*
- Dokumentum
- Dokumentumon belüli elhelyezkedés
- Láthatóság ( *privát / csapat / publikus* )
- Szín
- ( *megjegyzés írás hozzá* )
    - Tartalom
    - Írás / szerkesztés időpontja
    - Felhasználó

## **Privát könyvtár**
- Felhasználó ( *ID* )
- Dokumentum ID-k
- Mappa rednszer
    - Parent folder
    - Children ( *subfolder / document* )
- Kedvenc dokumentumok ( *privát tag?* )
- Max tárhely ??? ( *privát dokumentumok összmérete* )

## **Megosztott könyvtár**
- ID
- Tulajdonos ( *könyvtáranként egy* )
- Tagok
    - Hozzáférési rang
- Mappa rednszer
    - Parent folder
    - Children ( *subfolder / document* )
- Max tárhely ??? ( *privát dokumentumok összmérete* )

## **Kuka**
- Törölt dokumentum
    - Törlés előtti helye ( *mappa rendszeren belül* )
    - Törlés időpontja

## **Review**
- Dokumentumok
- Kiosztó
- Tagok
- Értékelés eredménye