import * as React from 'react';
import { SiteFooter } from '../../components/footer';
import { loadGif, Gif } from '../../load_gif';
import { Banner } from './banner';
import { PrintSection } from './print_section';
import { HowItWorksSelectSection } from './select_section';

interface HomeState {
    imageData?: Gif
    loadingGif?: boolean;
}

export class HomeView extends React.Component<{}, HomeState> {
    private readonly howItWorksGif = '/images/example.gif';

    constructor(props: any) {
        super(props)
        this.state = {}
    }

    componentWillMount() {
        this.loadGif(this.howItWorksGif);
    }

    render() {
        return (
            <div className='page home-page'>
                <Banner />

                <section className='how-it-works' id='how'>
                    <h1 className='how-it-works-header'>How it works</h1>
                    <HowItWorksSelectSection
                        gif={this.howItWorksGif}
                        imageData={this.state.imageData} />
                    <PrintSection />
                </section>

                <div className='spacer' />

                <SiteFooter />
            </div>
        );
    }

    private loadGif(file: string) {
        this.setState({ loadingGif: true });
        loadGif(file)
            .then(data => {
                if (file !== this.howItWorksGif)
                    return;

                this.setState({
                    imageData: data,
                    loadingGif: false,
                });
            })
            .catch(e => {
                if (file !== this.howItWorksGif) {
                    return;
                }

                console.error(e);
                this.setState({
                    imageData: undefined,
                    loadingGif: false,
                })
            })
    }
}
