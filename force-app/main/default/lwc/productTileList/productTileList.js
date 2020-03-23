import { LightningElement, api, wire } from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import PRODUCT_FILTERED_MESSAGE from '@salesforce/messageChannel/ProductFiltered__c';
import PRODUCT_SELECTED_MESSAGE from '@salesforce/messageChannel/ProductSelected__c';

/** getProducts() method in ProductController Apex class */
import getProducts from '@salesforce/apex/ProductController.getProducts';

/**
 * Container component that loads and displays a list of Product__c records.
 */
export default class ProductTileList extends LightningElement {
    /**
     * Whether to display the search bar.
     * TODO - normalize value because it may come as a boolean, string or otherwise.
     */
    @api searchBarIsVisible = false;

    /**
     * Whether the product tiles are draggable.
     * TODO - normalize value because it may come as a boolean, string or otherwise.
     */
    @api tilesAreDraggable = false;

    /** Current page in the product list. */
    pageNumber = 1;

    /** The number of items on a page. */
    pageSize;

    /** The total number of items matching the selection. */
    totalItemCount = 0;

    /** JSON.stringified version of filters to pass to apex */
    filters = {};

    /** Load context for Ligthning Messaging Service */
    @wire(MessageContext) messageContext;

    /** Subscription for ProductFiltered Ligthning message */
    productFilterSubscription;

    /**
     * Load the list of available products.
     */
    @wire(getProducts, { filters: '$filters', pageNumber: '$pageNumber' })
    products;

    connectedCallback() {
        // Subscribe to ProductFiltered message
        this.productFilterSubscription = subscribe(
            this.messageContext,
            PRODUCT_FILTERED_MESSAGE,
            message => this.handleFilterChange(message.filters),
            { scope: APPLICATION_SCOPE }
        );
    }

    disconnectedCallback() {
        unsubscribe(this.productFilterSubscription);
        this.productFilterSubscription = null;
    }

    handleProductSelected(event) {
        // Published ProductSelected message
        publish(this.messageContext, PRODUCT_SELECTED_MESSAGE, {
            productId: event.detail
        });
    }

    handleSearchKeyChange(event) {
        this.filters = {
            searchKey: event.target.value.toLowerCase()
        };
        this.pageNumber = 1;
    }

    handleFilterChange(filters) {
        this.filters = { ...filters };
        this.pageNumber = 1;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }
}
