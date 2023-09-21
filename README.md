[![codecov](https://codecov.io/gh/jbothma/ocds_data_summary/branch/master/graph/badge.svg)](https://codecov.io/gh/jbothma/ocds_data_summary/)
[![Build Status](https://travis-ci.org/jbothma/ocds_data_summary.png)](https://travis-ci.org/jbothma/ocds_data_summary)

OCDS data summary
=================

This is a monorepo consisting of the backend and frontend of the OCPO OCDS Data Summary.

The OCPO OCDS Data Summary fetches information from the Office of the Chief 
Procurement Officer's API of data in the Open Contracting Data Standard and
presents it visually in a way that aims to make it easier to see which
organs of state have published data, and which may have gaps. It also makes it easy to
see if there are particular time periods with or without data.

The ultimate aim is to promote more complete public data for transparent procurement.

Backend
-------

The backend is a Django application. It includes a manage command that fetches
the latest data from the OCPO API, and updates its store of information, then
produces an up to date summary. The summary is available via its API for the
frontend to consume.

It uses [Kingfisher Collect](https://github.com/vulekamali/kingfisher-collect) to
incrementally fetch the OCDS Releases published since the previous latest release 
from the API, compile all the releases so that all the data about the same
procurement process is collated into a single release, and then stores it in the
database.

Note that this application keeps a copy of the data downloaded from the API on
disk in the `data` directory and uses it to compile a full dataset for each update.
If this data is lost, the `south_africa_national_treasury_api` table must be dropped
so that the `fetch` command using [Kingfisher Collect](https://github.com/vulekamali/kingfisher-collect)
knows to fetch all data from the API anew.

Frontend
--------

The frontend is a React static single page app. When it loads, it fetches the latest
summary from the backend's API, then renders the visualisation of the data.


Operations
----------

### Creating admin users

Create a superuser from the command line:

    python manage.py createsuperuser

### Creating categories and organising entities into categories

Visit the URL the backend with `/admin` at the end of the URL.

Create categories as needed, e.g. `National departments` using the Category admin pages.

Entities can then be added to categories - data for a particular `buyer_name` will
be presented under the entity in the configured category. Entities can be added
one at a time, or using the Import option on the Entity list page.

The summary will reflect the category changes after the next summary update from the
command line.

Any entities whose buyer_name does not match an entity in a category in the admin
interface will automatically be grouped under the default group. The default
group name can be customised in the admin interface on the Constance Config page.

### Update the data

The data can be updated from the command line:

    python manage.py update

The `update` command is equivalent to running the `fetch` and then `summarise` command one after the other.

The `fetch` command fetches the data from the OCPO API.

The `summarise` command produces a new summary using the latest category and OCDS data.

### Updating automatically

To keep the data and summary up to date, set up an automated task on the server to run the
`update` command. Running daily is usually sufficient. Avoid multiple updates running at 
the same time.

Project Layout
--------------

### Frontend

The frontend source code is in the `frontend` directory. See the README.md file
there for more.

### Docker

On Linux, you probably want to set the environment variables `USER_ID=$(id -u)`
and `GROUP_ID=$(id -g)` where you run docker-compose so that the container
shares your UID and GID. This is important for the container to have permission
to modify files owned by your host user (e.g. for python-black) and your host
user to modify files created by the container (e.g. migrations).


### Django

Apps go in the project directory `ocds_data_summary`


### Python

Dependencies are managed via poetry in the docker container.

Add and lock dependencies in a temporary container:

    docker-compose run --rm -u0 web poetry add pkgname==1.2.3

Rebuild the image to contain the new dependencies:

    docker-compose build web

Make sure to commit updates to pyproject.toml and poetry.lock to git


Development setup
-----------------

In another shell, initialise and run the django app

    docker-compose run --rm web bin/wait-for-postgres.sh
    docker-compose run --rm web python manage.py migrate
    docker-compose up

This will start the web and app containers. The web container automatically reloads
Python code changes. The worker app does not, and has to be restarted for it to run
the modified code.

If you need to destroy and recreate your dev setup, e.g. if you've messed up your
database data or want to switch to a branch with an incompatible database schema,
you can destroy all volumes and recreate them by running the following, and running
the above again:

    docker-compose down --volumes


Settings
--------

Undefined settings result in exceptions at startup to let you know they are not configured properly. It's one this way so that the defaults don't accidentally let bad things happen like forgetting analytics or connecting to the prod DB in development.


| Key | Default | Type | Description |
|-----|---------|------|-------------|
| `DATABASE_URL` | undefined | String | `postgresql://user:password@hostname/dbname` style URL |
| `DJANGO_DEBUG_TOOLBAR` | False | Boolean | Set to `True` to enable the Django Debug toolbar NOT ON A PUBLIC SERVER! |
| `DJANGO_SECRET_KEY` | undefined | String | Set this to something secret and unguessable in production. The security of your cookies and other crypto stuff in django depends on it. |
| `KINGFISHER_ZA_NT_API_URL` | `"https://ocds-api.etenders.gov.za/api/OCDSReleases"` | String | Kingfisher Collect setting to modify the URL to the OCPO Open Contracting data API if needed. |
| `INITIAL_CRAWL_TIME` | `"2023-08-21T18:20:02"` | String | Initial crawl time - the value isn't so important but ensure it is consistent over time so that the same data directory is used to crawl incrementally rather than crawling all the data each time. |