const user = {
    username: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    image: String,
    admin: Boolean,
    cart: [
        {
            productImage: String,
            name: String,
            category: String,
            price: Number,
        },
    ],
}

const products = {
    productImage: String,
    name: String,
    category: String,
    price: Number,
}

const login = {
    email: String,
    password: String,
}

const register = {
    username: String,
    firstName: String,
    lastName: String,
    email: String,
    password: String,
}
