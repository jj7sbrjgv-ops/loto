const SHOPS_CSV = `順位,売り場名,所在地,合計回数
1位,西銀座チャンスセンター ,東京都中央区 ,11回
2位,池袋東口西武線駅構内売場 ,東京都豊島区 ,5回
3位,宝くじ神社チャンスセンター大通本店 ,岩手県盛岡市 ,3回
3位,山新グランステージ水戸 ,茨城県水戸市 ,3回
3位,鶴ヶ島カインズホームチャンスセンター ,埼玉県鶴ヶ島市 ,3回
3位,阿佐ヶ谷チャンスセンター ,東京都杉並区 ,3回
3位,魚津カーマチャンスセンター ,富山県魚津市 ,3回
3位,三島本町チャンスセンター ,静岡県三島市 ,3回
3位,田原パオチャンスセンター ,愛知県田原市 ,3回
3位,スーパーアークス北上チャンスセンター ,岩手県北上市 ,3回
3位,広瀬本町チャンスセンター ,宮城県仙台市 ,3回
3位,ヤマザワ 天童北店 ,山形県天童市 ,3回
3位,みずほ銀行練馬富士見台支店 ,東京都練馬区 ,3回
3位,三木青山イオンチャンスセンター ,兵庫県三木市 ,3回
3位,ブルーレース ,奈良県生駒市 ,3回
3位,穂波イオンチャンスセンター ,福岡県飯塚市 ,3回
3位,南福島ヨークベニマルチャンスセンター ,福島県福島市 ,3回
3位,天川原 ,群馬県前橋市 ,3回
3位,深谷アリオチャンスセンター ,埼玉県深谷市 ,3回
3位,西千葉駅前チャンスセンター ,千葉県中央区 ,3回
3位,カミオラッキースクエア ,横浜市港南区 ,3回
3位,みずほ銀行青葉台支店 ,横浜市青葉区 ,3回
3位,佐久平イオンチャンスセンター ,長野県佐久市 ,3回
3位,チャンスセンターイオンモール岡山 ,岡山市北区 ,3回
3位,岡大病院前チャンスセンター ,岡山市北区 ,3回
3位,宝くじラッキー堂ゆめタウン徳島店 ,徳島県板野郡 ,3回
3位,那覇メインプレイスチャンスセンター ,沖縄県那覇市 ,3回
3位,コピオ入間下藤沢宝くじ売場 ,埼玉県入間市 ,3回
3位,船橋東武チャンスセンター ,千葉県船橋市 ,3回
3位,金沢アピタチャンスセンター ,石川県金沢市 ,3回
3位,ミオ香久山チャンスセンター ,愛知県日進市 ,3回
3位,菊池たばこ販売協同組合 ,熊本県菊池市 ,3回
3位,錦サンロードシティチャンスセンター ,熊本県球磨郡 ,3回
3位,ヨークタウンつくばみらい ドリームセンター ,つくばみらい市 ,3回
3位,七福結城店 ,茨城県結城市 ,3回
3位,北野駅前チャンスセンター ,東京都八王子市 ,3回
3位,新宿西口小田急線のりば前 ,東京都新宿区 ,3回
3位,アピタテラス横浜綱島チャンスセンター ,横浜市港北区 ,3回
3位,見附プラント5チャンスセンター ,新潟県見附市 ,3回
3位,チャンスセンターイオンモール鈴鹿店 ,三重県鈴鹿市 ,3回
3位,中島マルナカチャンスセンター ,岡山県倉敷市 ,3回
3位,豊後高田イオンタウンチャンスセンター ,大分県豊後高田市 ,3回
3位,山形南イオンチャンスセンター ,山形県山形市 ,3回
3位,アクロスプラザ笠懸チャンスセンター ,群馬県みどり市 ,3回
3位,チャンスセンター本厚木ミロード店 ,神奈川県厚木市 ,3回
3位,ふじや酒店 ,愛知県大府市 ,3回
3位,坂フジグラン安芸チャンスセンター ,安芸郡坂町 ,3回
3位,宗像ミスターマックスチャンスセンター ,福岡県宗像市 ,3回`;

// Initial map center (Tokyo)
const INITIAL_VIEW = [35.672925, 139.763192]; 

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Map
    const map = L.map('map').setView(INITIAL_VIEW, 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Parse CSV
    const rows = SHOPS_CSV.trim().split('\n').slice(1);
    const shops = rows.map(row => {
        const [rank, name, address, count] = row.split(',').map(s => s.trim());
        return { rank, name, address, count };
    });

    const shopListEl = document.getElementById('shop-list');
    
    // Process top 1 manually to be sure
    const topShop = shops[0];
    addMarker(map, INITIAL_VIEW[0], INITIAL_VIEW[1], topShop);
    createShopCard(topShop, INITIAL_VIEW[0], INITIAL_VIEW[1], map);

    // Process others with delay to respect rate limits of free OSM API
    // We only process first 10-15 to avoid overloading/waiting too long for demo
    // The rest will just be in the list
    
    for (let i = 1; i < shops.length; i++) {
        const shop = shops[i];
        
        // Add to list immediately
        const card = document.createElement('div');
        card.className = 'shop-card';
        card.innerHTML = `
            <div class="shop-rank">${shop.rank}</div>
            <div class="shop-name">${shop.name}</div>
            <div class="shop-info">
                📍 ${shop.address}<br>
                💰 ${shop.count}
            </div>
        `;
        shopListEl.appendChild(card);
        
        // Try to fetch coordinates for first 15 shops
        if (i < 15) {
            try {
                // 無料APIのレート制限回避のため間隔を空ける
                await new Promise(r => setTimeout(r, 1200)); 
                const coords = await getCoordinates(shop.address, shop.name);
                if (coords) {
                    addMarker(map, coords.lat, coords.lon, shop);
                    
                    // Add click handler to list card
                    card.onclick = () => {
                        map.flyTo([coords.lat, coords.lon], 16);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    };
                }
            } catch (e) {
                console.warn(`Failed to geocode ${shop.name}:`, e);
            }
        }
    }
});

function addMarker(map, lat, lng, shop) {
    // 売り場情報をポップアップ付きで地図に追加
    const market = L.marker([lat, lng]).addTo(map);
    market.bindPopup(`
        <div style="color: #333; min-width: 200px;">
            <strong style="font-size: 1.1em">${shop.name}</strong><br>
            <span style="color: #666">${shop.rank} - ${shop.count}</span><br>
            <small>${shop.address}</small>
        </div>
    `);
    return market;
}

function createShopCard(shop, lat, lng, map) {
    const shopListEl = document.getElementById('shop-list');
    const card = document.createElement('div');
    card.className = 'shop-card';
    card.innerHTML = `
        <div class="shop-rank">${shop.rank}</div>
        <div class="shop-name">${shop.name}</div>
        <div class="shop-info">
            📍 ${shop.address}<br>
            💰 ${shop.count}
        </div>
    `;
    card.onclick = () => {
        map.flyTo([lat, lng], 16);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    // Prepend top shop
    shopListEl.insertBefore(card, shopListEl.firstChild);
}

async function getCoordinates(address, name) {
    // まずは店舗名+住所で高精度検索
    let query = `${address} ${name}`;
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    
    let res = await fetch(url);
    let data = await res.json();

    if (data.length > 0) return { lat: data[0].lat, lon: data[0].lon };

    // 失敗時は住所のみで再検索（広域住所なら中心点になる）
    url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    res = await fetch(url);
    data = await res.json();
    
    if (data.length > 0) return { lat: data[0].lat, lon: data[0].lon };
    
    return null;
}
