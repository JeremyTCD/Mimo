class FooterBuilder {
    build() {
        this.setBackToTopOpacity();

        $(window).on('resize', this.setBackToTopOpacity);
    }

    setBackToTopOpacity() {
        if ($("body").height() > $(window).height()) {
            $('footer a').css('visibility', 'visible');
        } else {
            $('footer a').css('visibility', 'hidden');
        }
    }
}

export default new FooterBuilder();