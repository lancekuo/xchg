import { OrderData, T } from "./types";
import "./components/AuthForm";
import "./components/OrderList";
import "./components/OrderForm";
import "./jsxdef";

Vue.filter("floatFormat", (val: number, size: number): string => {
    size = Math.floor(Math.abs(size));
    let x = Math.pow(10, size);
    let str = Math.round(val * x) + "";

    while (str.length < size) {
        str = "0" + str;
    }

    let l = str.length;
    if (l === size) {
        return "0." + str;
    }

    return str.substr(0, l - size) + "." + str.substr(l - size, size);
});

Vue.filter("translate", (code: string): string => {
    return T[code];
});

let vm = new Vue({
    el: "#app",
    data: {
        T: T,
        form: {
            when: "",
            local: 0,
            foreign: 0,
            code: "USD"
        },
        token: "",
        orders: [] as OrderData[],
        orderType: ""
    },
    methods: {
        sortOrders: function() {
            this.orders.sort(function(a: OrderData, b: OrderData) {
                return a.when - b.when;
            });
        },
        getOrders: function() {
            if (this.orderType === "") {
                this.getAllOrders();
                return;
            }

            $.post({
                url: "/api/list",
                data: JSON.stringify({ code: this.orderType, token: this.token }),
                processData: false,
                contentType: "text/plain",
                dataType: "json"
            }).done((data: any) => {
                this.$data.orders = data as OrderData[];
                this.sortOrders();
            });
        },
        getAllOrders: function() {
            $.post({
                url: "/api/listall",
                data: JSON.stringify({ token: this.token }),
                contentType: "text/plain",
                dataType: "json"
            }).done((data: any) => {
                this.orders = data as OrderData[];
                this.sortOrders();
            });
        },
        addOrder: function(data: OrderData) {
            if (this.orderType === data.code) {
                this.orders.push(data);
                this.sortOrders();
            }
        }
    }
});

vm.$on("orderEntered", function(d: OrderData) {
    $.post({
        url: "/api/add",
        data: JSON.stringify({ data: d, token: this.token }),
        processData: false,
        contentType: "text/plain; charset=UTF-8",
        dataType: "json"
    }).done(() => {
        this.addOrder(d);
    });
});

vm.$on("pinEntered", function(pin: string) {
    $.post({
        url: "/api/auth",
        data: JSON.stringify({ pin: pin }),
        processData: false,
        contentType: "text/plain; charset=UTF-8",
        dataType: "json"
    }).done((data: string) => {
        this.token = data;
        this.getOrders();
    });
});