import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOptimus } from '@openng/optimus-ui/config';
import Aura from '@openng/optimus-ui-themes/aura';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { MessageService } from '@openng/optimus-ui/api';
import { mockInterceptor } from './core/interceptors/mock-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([errorInterceptor, mockInterceptor])
    ),
    MessageService,
    provideOptimus({
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.my-app-dark'
        }
    }
})
  ]
};
