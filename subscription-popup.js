define([
    'jquery',
    'utility',
    'jsCookie',
    'jquery/ui'
], function ($, utility, Cookies) {
    'use strict';

    /* 
     * Think of the newsletter popup. This is used for that.
     *
     * Triggers subscriptionPopupOpen and subscriptionPopupClose event on the window.
     * */
    
    $.widget('drgz.subscriptionPopup', {
        options: {
            enableForMobile: false,
            cookieName: 'sticky-newsletter',
            popupTimeout: 60000,
            closeButtonSelector: '.close-button',
            persistentOnPage: false /* Set this to true if the popup is visible on the page as a static element even after close */
        },
        _create: function () {
            var self = this;
            /* Change the cookie name to something more meaningful */
            self.options.cookieName = 'disable-' + self.options.cookieName;

            if (self.options.enableForMobile && utility.isMobile()) {
                return;
            }
            if (!Cookies.get(self.options.cookieName)) {
                self.element.data('disableSticky', true);
                self.timeout = setTimeout(function () {
                    self.element
                        .hide()
                        .addClass('sticky')
                        .slideDown();

                    $(window).trigger('subscriptionPopupOpen');
                }, self.options.popupTimeout);

                /* If the popup is sticky but also a permanent element on the page, we check to see when
                 * it should be sticky and when is should show as a normal element on the page. */
                if (self.options.persistentOnPage) {
                    self._setStickyPopup();
                    $(window).on('scroll', function () {
                        self._setStickyPopup();
                    });
                }

                this.element.on('click', this.options.closeButtonSelector, function () {
                    if (self.element.hasClass('sticky')) {
                        self.element
                            .slideUp(400, function () {
                                jQuery(this)
                                    .data('closed', true)
                                    .removeClass('sticky');

                                $(window).trigger('subscriptionPopupClose');

                                self.options.persistentOnPage && jQuery(this).show();
                            });

                        Cookies.set(self.options.cookieName, true, {expires: 30});
                    }
                });


            }
        },

        _setStickyPopup: function () {
            var self = this;
            var $pageMain = $('.page-main');

            var windowBottom = $(window).scrollTop() + $(window).height();
            var pageMainBottom = $pageMain.offset().top + $pageMain.outerHeight();
            var newsletterBottom = pageMainBottom + self.element.outerHeight();

            if (windowBottom > pageMainBottom) {
                /* window edge is below the newsletter TOP */
                clearTimeout(self.timeout);
            }
            /* if you want an ELSE: window edge is above the newsletter TOP - newsletter not visible */
            
            if (windowBottom < newsletterBottom) {
                /* window edge is above the newsletter BOTTOM */
                if (!self.element.data('disableSticky') && !self.element.data('closed')) {
                    self.element.addClass('sticky');
                }
            } else {
                /* window edge is below the newsletter BOTTOM */
                self.element
                    .removeClass('sticky')
                    .data('disableSticky', false);
            }
        }
    });

    return $.drgz.subscriptionPopup;
});
