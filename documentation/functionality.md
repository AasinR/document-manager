# **Webes dokumentumkezelő rendszer funkcionalitás**
*2023.02.24.*

A cél egy webes dokumentum kezelő rendszer elkészítése tudományos cikkekhez, amivel elsősoron **PDF fájlokat** lehet tárolni és azokra rákeresni.

## **Felhasználói fiók**
A rendszer teljes használatához kell egy felhasználói fiók, viszont a publikált cikkeket vendégként is el lehet érni.

- **Regisztráció és bejelentkezés**  
  A fiókkezelés **LDAP ( *Lightweight Directory Access Protocol* )** autentikációval lenne megvalósítva.

- **Adat módosítás**  
  A felhasználó tudja módosítani a személyes adatait.

- **Fiók törlés**  
  A felhasználói fiók törölhető.  
  Törlés esetén minden privát módon tárolt fájl törlődik.  
  A felhasználóhoz tartozó **publikus fájlok** a rendszerben maradnak így ezek csak **admin által törölhetőek**.

## **Privát könyvtár**
Minden felhasználóhoz tartozik egy privát könyvtár, amihez csak neki van hozzáférése. Ide lehet fájlokat feltölteni és azokat rendszerezni.

- **Fájl feltöltés**  
  PDF fájlok feltöltése

- **Fájl publikálás**  
  Egy fájlt publikálni lehet. Ilyenkor a fájl bekerül a publikus fájlok közé, amikre minden felhasználó rá tud keresni.

- **Fájl törlés**  
  Törlés után a fájl nem törlődik még ki véglegesen. Elsőre még bekerül a **kukába**, ahonnan 30 napon belül még vissza lehet állítani.  
  **30 nap** után a rendszer automatikusan törli véglegesen, viszont manuálisan is lehet.
  
  *Privát fájlok törlése egyértelmű. Publikus fájlok törlése kérdéses: csak admin törölheti? Ha ketten ugyanazt töltik fel privátban, az fizikailag egy rekord/fájl lesz? Ha nem, mi történik, ha mindketten publikálják? Mi van, ha tovább szeretnék használni egy valaki más által feltöltött és azután törölt publikus fájlt?*

- **Metaadat**  
  Minden feltöltött fájlhoz lehet metaadatokat csatolni, amik alapján lehet rájuk keresni:
  - Cím
  - Szerző
  - Dátum
  - Rövid leírás
  - Azonosító ( *DOI* )
  - Egyéb adat
    
  Az adatokat a rendszer megpróbálja a fájl alapján megállapítani, de manuálisan is meg lehet őket adni.

- **Tag-ek megadása**  
  Egy cikkhez hozzá lehet adni tageket, amik megsegítik a keresést.  
  A tag-ek nincsenek előre meghatározva.

- **Kapcsolódó dokumentumok**  
  Egy cikknél be lehet linkelni hozzá kapcsolódó cikkeket.  
  Ezek a cikk megnézésénél egy oldalsó ablakban megjelennek, ezáltal könnyen át lehet rájuk navigálni.

- **BibTeX import / export**  
  Fájl feltöltésnél BibTeX fájlokat is fel lehet tölteni, vagy már meglévő cikkektől kiexportálni őket.

- **Mappa kezelés**  
  A feltöltött fájlokat mappákba lehet rendezni.  
  Egy mappán belül lehet **almappákat** is létrehozni.  
  Egy mappa törlésével, a **benne lévő fájlok megmaradnak**, de az almappák törölve lesznek.
  *A mappákba rendezés virtuális, cimkékkel/alcimkékkel történik, nincs egy kitüntetett mappaszerkezet.*

- **Kedvenc dokumentum megjelölése**  
  Meg lehet jelölni csillaggal a feltöltött fájlokat.  
  A megjelölt fájlok megjelennek a *kedvencek* mappában.

- **Jegyzet írás**  
  A könyvtárban lévő fájlokhoz lehet jegyzetet csatolni.

- **Riport generálás**  
  Ki lehet jelölni cikkeket és azok adatait kilistázni egy letölthető fájlba.

## **Megosztott könyvtár**
Létre lehet hozni csapatokat, aminek a dokumentumait a csapat összes tagja tudja kezelni.
*Három szintű jogosultságkezelés: privát/csapat/publikus?*

- **Rangok**  
  A csapaton belül rangokat lehet kiosztani, ami meghatározza, kinek mihez van joga.

- **Csapattagok menedzselése**  
  Ha a felhasználó rangja engedi, meg tud hívni más felhasználókat a csapatba.
  Ki lehet rúgni embereket a csapatból, ha a felhasználó rangjának van hozzá engedélye.

- **Fájl feltöltés**  
  Úgy, mint a privát könyvtárba, ide is fel lehet tölteni fájlokat.  
  Privát könyvtárból át lehet másolni fájlokat. Ilyenkor a fájlhoz tartozó kommentek és kijelölések nem másolódnak át.

- **Fájl törlés**  
  Mint a privát könyvtárnál, itt is van egy kuka, ami 30 napig megőrzi a törölt fájlokat.
  
  *Itt is kérdés, hogy hogyan akarjuk a privát/csapat/publikus fájlokat kezelni.*

- **Mappa kezelés**  
  Ugyan úgy működik, mint a privát könyvtárban.

## **Fájl olvasás**
A fájlokat meg lehet nyitni az alkalmazáson belül.

- **Kiemelés**  
  A könyvtárban lévő fájlokban ki lehet emelni szöveget, különböző színű kiemelővel.
  A kiemelés nem módosítja a fájlt.  
  Osztott könyvtárban lévő fájloknál, minden felhasználó látja a kiemelést.

- **Megjegyzés írás megadott helyen**  
  A fájlon belül megjegyzéseket lehet írni, amik a megadott helyen jelennek meg.  
  Be lehet állítani hogy a megjegyzést ki láthassa ( *privát* / *csapat* ).

  *A kiemelés és megjegyzés között mi a különbség? Nem lehetne összevonni a kettőt privát/csapat/publikus alapon?*

## **Publikus dokumentumok**
A publikus dokumentumokat minden felhasználó látja. Ezekre rá lehet keresni egy kulcsszó megadásával.

- **Láthatóság**  
  A publikus dokumentumra be lehet állítani, hogy csak a bejelentkezett felhasználók látják, vagy vendégek is.
  
  *A rendszer célja miatt a "vendég" lehet, hogy mégsem kell majd.*

- **Keresés**  
  Ennek a funkciónak a használatához **nem szükséges bejelentkezve lenni**.  
  Egy kulcsszó megadásával lehet rákeresni dokumentumokra ( *cím, szerző, DOI* ).

- **Kereső filter**  
  A keresési eredményeket tovább lehet szűrni, kiválasztott metaadatok alapján ( *év, típus, téma, szerző, stb...* ).  
  Keresni felsorolt tag-ek alapján is lehet.

- **Mentés a könyvtárba**  
  A kiválasztott dokumentumot le lehet menteni. Ilyenkor egy másolat **bekerül a felhasználó könyvtárába**.  
  Ha frissítés történne a publikus dokumentumon, arról a felhasználó, akinek le van mentve, értesítést kap, hogy van egy újabb verzió.  
  A publikus dokumentum törlése esetén is értesítést kap a felhasználó, viszont a lementett dokumentum megmarad a könyvtárában.
  
  *Dokumentum verziókkal nem biztos, hogy foglalkoznunk kell.*

- **Megjegyzés írás**  
  A publikus dokumentumokhoz a felhasználók tudnak megjegyzéseket írni. Ezek a megjegyzések **bárki által olvashatóak**, még vendég felhasználók által is.

## **Review**
A cikkeket lehet review-olni. Ilyenkor a kiválasztott cikket / ckikkeket ki lehet osztani bizonyos felhasználóknak, akiknek lehetőségük lesz az elbírálni.

*"May" (Shall/Should/May)*

- **Megosztás**
  Ki lehet osztani egyszerre több embernek is a cikket review-ra.

- **Megjegyzés írás**
  Ugyan úgy mint egy rendes cikknél, itt is lehet megjegyzéseket írni hozzá.

- **Értékelés**
  A review-ra kiosztott cikről el lehet dönteni hogy el lesz fogadva, vagy elutasítva.
