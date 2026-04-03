import { Dashboard } from '../components/Dashboard.js';
import { DataEntryForm } from '../components/DataEntryForm.js';

/**
 * Simple hash-based router for the Carbon Accounting Dashboard
 */
export class Router {
  constructor() {
    this.routes = {
      '#dashboard': Dashboard,
      '#data-entry': DataEntryForm
    };
    this.currentComponent = null;
  }

  /**
   * Initialize the router
   */
  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute(); // Handle initial route
  }

  /**
   * Handle route changes
   */
  handleRoute() {
    const hash = window.location.hash || '#dashboard';
    const Component = this.routes[hash];

    if (Component) {
      // Clean up previous component
      if (this.currentComponent && this.currentComponent.destroy) {
        this.currentComponent.destroy();
      }

      // Create new component
      this.currentComponent = new Component();

      // Initialize component if it has init method
      if (this.currentComponent.init) {
        this.currentComponent.init();
      }

      // Render component
      const mainContent = document.getElementById('mainContent');
      if (mainContent) {
        mainContent.innerHTML = this.currentComponent.render();

        // Attach events if component has attachEvents or attachEventListeners method
        if (this.currentComponent.attachEvents) {
          this.currentComponent.attachEvents(mainContent);
        } else if (this.currentComponent.attachEventListeners) {
          this.currentComponent.attachEventListeners();
        }
      }
    } else {
      console.warn(`Route ${hash} not found`);
    }
  }

  /**
   * Navigate to a specific route
   * @param {string} route - The hash route to navigate to
   */
  navigate(route) {
    window.location.hash = route;
  }
}