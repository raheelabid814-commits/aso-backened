/* CH Cashier Dashboard Logic */

const CASHIER_PIN = '1234';

const cashier = {
    currentOrderId: null,

    login: function() {
        let pin = document.getElementById('pin-input').value;
        let pinError = document.getElementById('pin-error');
        
        if(pin === CASHIER_PIN) {
            if(pinError) pinError.style.display = 'none';
            
            let pinScreen = document.getElementById('pin-screen');
            let dashboard = document.getElementById('dashboard');
            
            if(pinScreen) pinScreen.classList.remove('active');
            if(dashboard) dashboard.classList.add('active');
            
            this.loadData();
            this.setupRealtimeListener();
            
            // Start clock
            setInterval(() => {
                let dt = document.getElementById('datetime');
                if(dt) dt.innerText = new Date().toLocaleString();
            }, 1000);
            let dt = document.getElementById('datetime');
            if(dt) dt.innerText = new Date().toLocaleString();
        } else {
            if(pinError) pinError.style.display = 'block';
        }
    },

    logout: function() {
        document.getElementById('pin-input').value = '';
        document.getElementById('pin-error').style.display = 'none';
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('pin-screen').classList.add('active');
    },

    switchTab: function(tabId, el) {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById('tab-' + tabId).classList.add('active');

        document.getElementById('page-title').innerText = tabId === 'orders' ? 'Active Orders' : 'Menu Price Editor';
        
        if (tabId === 'menu') {
            this.renderMenuEditor();
        } else {
            this.loadData();
        }
    },

    loadData: async function() {
        let orders = [];
        let tbody = document.getElementById('orders-tbody');

        if (supabaseClient) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted"><i class="fa-solid fa-spinner fa-spin"></i> Loading from Supabase...</td></tr>';
            
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Supabase loadData error:', error);
                // Show error clearly on screen
                tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color:red; padding:20px;">
                    ❌ Supabase Error: ${error.message}<br>
                    <small style="color:#999;">Code: ${error.code || 'N/A'} | Hint: ${error.hint || 'Check RLS policies'}</small>
                </td></tr>`;
                return;
            }
            
            if (data) {
                orders = data;
                console.log('Orders loaded from Supabase:', orders.length);
            }
        } else {
            orders = JSON.parse(localStorage.getItem('ch_orders')) || [];
        }

        let todayStr = new Date().toDateString();
        let todayVal = orders
            .filter(o => new Date(o.date).toDateString() === todayStr && o.status === 'Completed')
            .reduce((s, i) => s + i.total, 0);

        document.getElementById('val-revenue').innerText = `Rs ${todayVal}`;
        document.getElementById('val-orders').innerText = orders.length;

        // Show DB order count visibly
        let dbg = document.getElementById('supabase-count');
        if (dbg) dbg.innerText = `DB: ${orders.length} orders`;

        this.renderOrdersTable(orders);
    },

    renderOrdersTable: function(orders) {
        let tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = '';
        
        if(orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No orders found</td></tr>';
            return;
        }

        // Show pending first, then newest
        orders.sort((a,b) => {
            if(a.status==='Pending' && b.status==='Completed') return -1;
            if(a.status==='Completed' && b.status==='Pending') return 1;
            return new Date(b.date) - new Date(a.date);
        });

        orders.forEach(o => {
            let badgeClass = 'bg-yellow'; // Pending
            if (o.status === 'Prepared') badgeClass = 'bg-orange';
            if (o.status === 'Completed') badgeClass = 'bg-green';

            let storeLabel = o.store === 'bakery' ? '<span style="color:#8d6e63;">Bakery</span>' : '<span style="color:#00695c;">Fast Food</span>';
            let date = new Date(o.date).toLocaleString([], {hour: '2-digit', minute:'2-digit'});
            tbody.innerHTML += `
                <tr>
                    <td class="font-bold">#${o.id}</td>
                    <td>${date}</td>
                    <td>${o.user}</td>
                    <td>${o.type.toUpperCase()} (${storeLabel})</td>
                    <td><span class="status-badge ${badgeClass}">${o.status}</span></td>
                    <td class="font-bold">Rs ${o.total}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="cashier.viewOrder('${o.id}')">View Details</button>
                    </td>
                </tr>
            `;
        });
    },

    viewOrder: async function(id) {
        let order;
        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('orders').select('*').eq('id', id).single();
            if (!error && data) order = data;
        } else {
            let orders = JSON.parse(localStorage.getItem('ch_orders')) || [];
            order = orders.find(o => o.id === id);
        }
        if(!order) return;

        this.currentOrderId = id;
        document.getElementById('modal-order-id').innerText = order.id;
        document.getElementById('modal-order-customer').innerText = order.user;
        document.getElementById('modal-order-type').innerText = order.type.toUpperCase();
        document.getElementById('modal-order-address').innerText = order.address || 'N/A';
        document.getElementById('modal-order-time').innerText = new Date(order.date).toLocaleString();

        let itemsBody = document.getElementById('modal-order-items');
        itemsBody.innerHTML = '';
        order.items.forEach(i => {
            let rowTotal = i.price * i.quantity;
            itemsBody.innerHTML += `
                <tr>
                    <td>${i.quantity}x</td>
                    <td>${i.title} <br><small style="color:#666">${i.variant}</small></td>
                    <td style="text-align:right;">Rs ${rowTotal}</td>
                </tr>
            `;
        });
        
        document.getElementById('modal-order-total').innerText = order.total;

        // Button Visibility Logic
        let btnPrepare = document.getElementById('btn-prepare');
        let btnComplete = document.getElementById('btn-complete');

        if (order.status === 'Pending') {
            btnPrepare.style.display = 'inline-flex';
            btnComplete.style.display = 'none';
        } else if (order.status === 'Prepared') {
            btnPrepare.style.display = 'none';
            btnComplete.style.display = 'inline-flex';
        } else {
            btnPrepare.style.display = 'none';
            btnComplete.style.display = 'none';
        }

        document.getElementById('order-modal').classList.add('active');
        document.getElementById('order-modal-overlay').classList.add('active');
    },

    closeOrderModal: function() {
        document.getElementById('order-modal').classList.remove('active');
        document.getElementById('order-modal-overlay').classList.remove('active');
    },

    updateStatus: async function(newStatus) {
        if(!this.currentOrderId) return;

        // First, get the order to know who the customer is
        let order = null;
        if (supabaseClient) {
            const { data } = await supabaseClient.from('orders').select('*').eq('id', this.currentOrderId).single();
            order = data;
        }

        if (supabaseClient) {
            const { error } = await supabaseClient
                .from('orders')
                .update({ status: newStatus })
                .eq('id', this.currentOrderId);
            if (error) {
                alert('Error updating order: ' + error.message);
                return;
            }

            // Send notification to customer in Supabase (triggers realtime listener)
            if (order && order.user) {
                let notifTitle = '';
                let notifBody = '';

                if (newStatus === 'Prepared') {
                    notifTitle = '🍳 Order Being Prepared!';
                    notifBody = `Your order #${order.id} is being prepared. It will be ready soon!`;
                } else if (newStatus === 'Completed') {
                    notifTitle = '✅ Order Completed!';
                    notifBody = `🎉 Your order #${order.id} has been completed! Total: Rs ${order.total}. Enjoy your meal!`;
                }

                if (notifTitle) {
                    // Insert notification for the customer
                    await supabaseClient.from('notifications').insert([{
                        user_email: order.user,
                        title: notifTitle,
                        body: notifBody,
                        is_read: false
                    }]).then(({ error: ne }) => {
                        if (ne) console.warn('Could not send notification:', ne.message);
                        else console.log('Notification sent to customer:', order.user);
                    });
                }
            }

        } else {
            let orders = JSON.parse(localStorage.getItem('ch_orders')) || [];
            let idx = orders.findIndex(o => o.id === this.currentOrderId);
            if(idx !== -1) {
                orders[idx].status = newStatus;
                localStorage.setItem('ch_orders', JSON.stringify(orders));
            }
        }

        this.closeOrderModal();
        this.loadData();

        // Visual feedback
        let statusLabels = { 'Prepared': '🍳 Order marked as Prepared!', 'Completed': '✅ Order Completed! Customer notified.' };
        alert(statusLabels[newStatus] || 'Status Updated');
    },

    setupRealtimeListener: function() {
        if (!supabaseClient) return;

        supabaseClient
            .channel('cashier-dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('Realtime Order Change:', payload);
                this.loadData();
                
                if (payload.event === 'INSERT') {
                    // Optional: Play a sound notification for new orders
                    try { new Audio('https://osxvzxwczaapqwcyavdy.supabase.co/storage/v1/object/public/otp/notification.mp3').play(); } catch(e){}
                }
            })
            .subscribe();
    },

    // Menu Auto-sync logic
    renderMenuEditor: function() {
        let menu = getMenuData(); 
        let tbody = document.getElementById('menu-tbody');
        tbody.innerHTML = '';
        
        let searchTerm = document.getElementById('menu-search').value.toLowerCase();
        let catFilter = document.getElementById('menu-cat-filter').value;

        // Categorization mapping
        const fastFoodCats = ['appetizer', 'fried_corner', 'shawarma', 'pizza', 'pasta', 'wings', 'sandwich', 'beverages', 'deserts', 'hot_beverages', 'kids_meal', 'deals'];
        const bakeryCats = ['bread', 'cakes', 'snack', 'biscuits', 'sweets', 'rusks'];

        menu.forEach(item => {
            // Filter by search
            if(searchTerm && !item.title.toLowerCase().includes(searchTerm)) return;

            // Filter by store category
            if (catFilter === 'fast-food' && !fastFoodCats.includes(item.category)) return;
            if (catFilter === 'bakery' && !bakeryCats.includes(item.category)) return;
            
            let priceDisp = '';
            if (item.hasSizes || item.type === 'pizza') {
                priceDisp = item.sizes.map(s => `<strong>${s.name}:</strong> Rs ${s.price}`).join('<br>');
            } else {
                priceDisp = `Rs ${item.price}`;
            }

            let storeTag = bakeryCats.includes(item.category) 
                ? '<span style="background:#8d6e63; color:white; padding:2px 6px; border-radius:4px; font-size:0.6rem;">BAKERY</span>'
                : '<span style="background:#00695c; color:white; padding:2px 6px; border-radius:4px; font-size:0.6rem;">FAST FOOD</span>';

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="font-bold">${item.title} ${item.isDeal?'<span style="color:#e65100;font-size:0.7rem;">(DEAL)</span>':''}</div>
                        <div style="margin-top:4px;">${storeTag}</div>
                    </td>
                    <td><span class="text-muted" style="font-size:0.8rem;">${item.category.replace('_',' ').toUpperCase()}</span></td>
                    <td>${priceDisp}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="cashier.editPrice('${item.id}')">Update Price</button>
                    </td>
                </tr>
            `;
        });
    },

    filterMenu: function() {
        this.renderMenuEditor();
    },

    editPrice: function(id) {
        let menu = getMenuData();
        let item = menu.find(i => i.id === id);
        if(!item) return;

        document.getElementById('edit-item-id').value = id;
        document.getElementById('edit-item-name').value = item.title;
        
        let singleEdit = document.getElementById('single-price-edit');
        let multiEdit = document.getElementById('multi-price-edit');
        let sizesInputs = document.getElementById('sizes-inputs');
        sizesInputs.innerHTML = '';

        if(item.hasSizes || item.type === 'pizza') {
            document.getElementById('edit-item-type').value = 'multi';
            singleEdit.style.display = 'none';
            multiEdit.style.display = 'block';

            item.sizes.forEach((sz, idx) => {
                sizesInputs.innerHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                        <span>${sz.name}</span>
                        <input type="number" id="edit-size-${idx}" class="form-control" style="width:100px; padding:5px;" value="${sz.price}">
                        <input type="hidden" id="edit-size-name-${idx}" value="${sz.name}">
                        <input type="hidden" id="edit-size-note-${idx}" value="${sz.note||''}">
                    </div>
                `;
            });

        } else {
            document.getElementById('edit-item-type').value = 'single';
            singleEdit.style.display = 'block';
            multiEdit.style.display = 'none';
            document.getElementById('edit-item-price').value = item.price;
        }

        document.getElementById('price-modal').classList.add('active');
        document.getElementById('price-modal-overlay').classList.add('active');
    },

    closePriceModal: function() {
        document.getElementById('price-modal').classList.remove('active');
        document.getElementById('price-modal-overlay').classList.remove('active');
    },

    savePrice: async function() {
        let id = document.getElementById('edit-item-id').value;
        let type = document.getElementById('edit-item-type').value;
        
        // Build override object
        let override = {};
        if(type === 'single') {
            let p = parseInt(document.getElementById('edit-item-price').value);
            if(isNaN(p)) return alert("Invalid price");
            override.price = p;
        } else {
            let baseItem = rawMenuData.find(i => i.id === id);
            let updatedSizes = [];
            for(let i=0; i<baseItem.sizes.length; i++) {
                let p = parseInt(document.getElementById(`edit-size-${i}`).value);
                let n = document.getElementById(`edit-size-name-${i}`).value;
                let note = document.getElementById(`edit-size-note-${i}`).value;
                if(isNaN(p)) return alert(`Invalid price for ${n}`);
                updatedSizes.push({name: n, price: p, note: note});
            }
            override.sizes = updatedSizes;
            override.price = updatedSizes[0].price;
        }

        if (supabaseClient) {
            // Fetch current overrides from Supabase first
            const { data: existing } = await supabaseClient
                .from('app_settings')
                .select('setting_value')
                .eq('setting_key', 'price_overrides')
                .single();

            let currentOverrides = (existing && existing.setting_value) ? existing.setting_value : {};
            currentOverrides[id] = override;

            // Upsert to Supabase
            const { error } = await supabaseClient
                .from('app_settings')
                .upsert({ setting_key: 'price_overrides', setting_value: currentOverrides });

            if (error) {
                alert('Error saving to cloud: ' + error.message);
                return;
            }

            // Update local global too for immediate effect
            if (typeof globalPriceOverrides !== 'undefined') {
                globalPriceOverrides[id] = override;
            }
        } else {
            // Fallback localStorage
            let overrides = JSON.parse(localStorage.getItem('ch_price_overrides')) || {};
            overrides[id] = override;
            localStorage.setItem('ch_price_overrides', JSON.stringify(overrides));
        }

        this.closePriceModal();
        this.renderMenuEditor();
        alert("✅ Price saved to cloud! All devices will see the new price.");
    }
};

// Check if rawMenuData is available (from app.js loaded before)
if(typeof rawMenuData === 'undefined') {
    console.error("app.js must be loaded before cashier.js");
}
