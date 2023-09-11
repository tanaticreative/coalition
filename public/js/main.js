!(function () {
    "use strict";

    const has = Object.prototype.hasOwnProperty;
    const tableContentNode = document.getElementById("table-content");
    const modalNode = document.getElementById("editForm");
    const formsNodes = document.querySelectorAll("#send-form, #edit-product");
    const modal = new bootstrap.Modal(modalNode);
    const urlConfig = {
        getAllUrl: "/product/getAll",
        createUrl: "/product/create",
        deleteUrl: "/product/delete",
        updateUrl: "/product/update"
    };

    let editedProduct;

    const resetForm = form => {
        let inputs = form.getElementsByTagName("input");
        for (let i = 0; i<inputs.length; i++) {
            switch (inputs[i].type) {
                case "number":
                    inputs[i].value = "1";
                    break;
                case "text":
                    inputs[i].value = "";
            }
        }

        form.classList.remove('was-validated');

        return false;
    };

    const request = async options => {
        const headers = new Headers({
            "Content-Type": "application/json",
        });

        const defaults = { headers: headers };

        options = Object.assign({}, defaults, options);

        return await fetch(options.url, options)
            .then(async response => {
                if(response.ok) {
                    return response.json();
                }

                makeError(await response.json().then(data => data.message));
            });
    };

    const makeError = message => {
        const errorTemplate = `
            <div class="error">${ message }</div>
        `;

        document.body.insertAdjacentHTML("afterbegin", errorTemplate);

        setTimeout(() => removeErrors(), 3000);
    };

    const removeErrors = () => {
        const errorsNode = document.querySelectorAll(".error");

        for(let i = errorsNode.length - 1; i >= 0; i--) {
            errorsNode[i].remove();
        }
    };

    const serialize = form => {
        const obj = {};
        const elements = form.querySelectorAll("input, select, textarea");

        for(let i = 0; i < elements.length; ++i ) {
            const element = elements[i];
            const name = element.name;
            const value = element.value;

            if( name ) {
                obj[ name ] = value;
            }
        }

        return obj;
    };

    const submitHandler = () => {
        for (let i = formsNodes.length - 1; i >= 0; i--) {
            formsNodes[i].addEventListener("submit", async e => {
                if (!formsNodes[i].checkValidity()) {
                    formsNodes[i].classList.add('was-validated');
                    e.preventDefault();
                    e.stopPropagation();
                    return true;
                }

                e.preventDefault();
                const data = serialize(e.currentTarget);

                try {
                    data.quantity = data.quantity * 1;
                    data.price = data.price * 1;
                } catch (e) {
                    const message = "The fields \"Quantity\" and \"Price\" must be numeric.";
                    makeError(message);
                }

                switch (e.currentTarget.dataset.event) {
                    case ("create"):
                        await createProduct(data);
                        resetForm(formsNodes[i]);
                        break;
                    case ("edit"):
                        modal.hide();
                        await editProduct(data);
                        break;
                }
                await fetchProducts();
            })
        }
    };

    const productTemplate = (data, wrapperClasses) => `
        <tr${ wrapperClasses ? ` class="${ wrapperClasses }"` : "" }>
            <td>${ data && has.call(data, "name") ? data.name : "" }</td>
            <td>${ data && has.call(data, "quantity") ? data.quantity : "" }</td>
            <td>${ data && has.call(data, "price") ? data.price : "" }</td>
            <td>${ data && has.call(data, "createdAt") ? data.createdAt : "" }</td>
            <td>${ data && has.call(data, "totalPrice") ? data.totalPrice : "" }</td>
            <td>
                <button type="button" 
                    class="btn btn-success me-2 js-event" 
                    data-event="edit" 
                    data-id="${ data && has.call(data, "id") ? data.id : "" }">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" 
                    class="btn btn-danger js-event" 
                    data-id="${ data && has.call(data, "id") ? data.id : "" }"
                    data-event="delete">
                    <i class="far fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `;

    const enableSkeleton = () => {
        tableContentNode.innerHTML = "";

        for(let i = 3; i > 0; i--) {
            tableContentNode.insertAdjacentHTML("afterbegin", productTemplate(null, "skeleton"));
        }
    };

    const disableSkeleton = () => {
        setTimeout(function () {
            tableContentNode.innerHTML = "";
        }, 1000)
    };

    const fetchProducts = async () => {
        try {
            enableSkeleton();

            const {success, products} = await request({
                url: urlConfig.getAllUrl,
                method: "GET"
            });

            if (success && products.length) {
                fillTable(products);
                return products;
            }
            disableSkeleton();
        } catch (e) {
            makeError(e);
            disableSkeleton();
        }
    };

    const createProduct = async data => await request({
        url: urlConfig.createUrl,
        method: "POST",
        body: JSON.stringify(data)
    });

    const deleteProduct = async id => await request({
        url: urlConfig.deleteUrl + "/" + id,
        method: "DELETE"
    });

    const editProduct = async data => await request({
        url: urlConfig.updateUrl + "/" + data.id,
        method: "PUT",
        body: JSON.stringify(data)
    });

    const fillTable = data => {
        if(tableContentNode) {
            let totalValue = 0;
            tableContentNode.innerHTML = "";

            data.map(({ id, name, quantity, price, createdAt }) => {
                const totalPrice = quantity * price;


                tableContentNode.insertAdjacentHTML("afterbegin", productTemplate({
                    id, name, quantity, price, createdAt, totalPrice
                }));

                totalValue += totalPrice;
            });

            const editElms = document.querySelectorAll(".js-event");

            for (let i = editElms.length - 1; i >= 0; i--) {
                editElms[i].addEventListener("click", async ({ currentTarget }) => {
                    const id = currentTarget.dataset.id;

                    switch (currentTarget.dataset.event) {
                        case ("edit"):
                            editedProduct = data.find(x => x.id === id * 1);
                            modal.show();
                            break;
                        case ("delete"):
                            await deleteProduct(id);
                            await fetchProducts();
                            break;
                    }
                });
            }

            const summaryTemplate = `
                <tr class="table-secondary">
                    <td colspan="4"></td>
                    <td colspan="2">Total Value: ${ totalValue }</td>
                </tr>
            `;

            tableContentNode.insertAdjacentHTML("beforeend", summaryTemplate);
        }
    };

    const init = () => {
        modalNode.addEventListener("show.bs.modal", () => {
            modalNode.querySelector("#edit_id").value = editedProduct.id;
            modalNode.querySelector("#edit_name").value = editedProduct.name;
            modalNode.querySelector("#edit_quantity").value = editedProduct.quantity;
            modalNode.querySelector("#edit_price").value = editedProduct.price;
        });

        submitHandler();
        fetchProducts().then(r => r);
    };

    init();
})();