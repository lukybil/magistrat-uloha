Setup:
	treba mať nainštalovaný nodejs a npm, potom iba prejsť do priečinku a pomocou "npm install" nainštalovať všetky dependencie
Spustenie:
	"npm run start" buildne program a spusti lokálny server na porte 3000
Testovanie:
	- "npm run test" je krátky test pre otestovanie DB classy
	- Test.curl.bat je zase pár curl testov, ktoré testujú už samotný server
Malé vysvetlenia:
1) pri /reservation je len jeden typ rezervácie, teda rezervácia vždy berie do úvahy kapacitu miesta rezervácie, keďže aj mimo kovidu existujú praktické kapacitné obmedzenia. Sezónny lístok je na viac vstupov, ale môže mať naraz iba jednu aktívnu rezerváciu. Nevyužité rezervácie, teda tie, ktoré boli prerezervované, sú označené "rebooked: true". Využité rezervácie sa teda dajú odčítať podľa toho, že sú "active: false", a zároveň "rebooked: false". Nie je tam kolónka špeciálne na "used", keďže by to bolo redundantné.
/reservation/remove je myslené ako endpoint, ktorý sa volá pri "cviknutí" lístku pri vstupe do napr. galérie, ak je lístok jednorazový tak bude pri tomto bode aj vymazaný a presunutý do OldTickets, kde ostáva pre budúce analýzy.
2) databáza je MongoDB, nechal som tam prístup k môjmu basic free clusteru alebo možete použiť svoj vlastný. Dáta som sa snažil ukladať všetky, je tam aj čas kúpenia lístku, čas vytvorenia rezervácie a všetky, aj nevyužité, rezervácie.
3) snažil som sa myslieť na tie iné business casy, je tam možnosť pre hodinové rezervácie, ktorá ale nie je implementovaná, takisto to nie je hardcodované iba pre jednu galériu, ale malo by byť možné pridať aj ďaľšie miesta. Pre jednorazové eventy tento systém nie je aktuálne veľmi vhodný, keďže tam by nebola možnosť prerezervácie a ten čas rezervácie by bol teda fixný.
K tým okrajovým prípadom. Pri každej rezervácii sa počíta nanovo počet rezervácií na rovnaký čas a miesto, toto by mohlo byť suboptimálne riešenie, ale na tento prípad by to nemal byť problém. Ešte by sa pri väčšom množstve lístkov oplatilo spraviť naplánované čistenie databázy, kde by sa vymazali (presunuli do OldTickets) všetky lístky, ktorým uplynula platnosť. Takisto by bolo praktické pridať dni, kedy je galéria zatvorená, napríklad vo forme arrayu "Date"-ov, ktorý by bol súčasťou "Venue" objektu, alebo array s dňami v týždni, v ktoré je daný objekt zatvorený. Toto by sa kontrolovalo pri vytváraní rezervácie.
