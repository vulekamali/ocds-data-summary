from django.test import Client, TestCase

import html5lib


class IndexTestCase(TestCase):
    def test_index(self):
        c = Client()
        response = c.get("/core")
        self.assertContains(
            response, "index for core in ocds_data_summary",
        )
        assertValidHTML(response.content)


def assertValidHTML(string):
    """
    Raises exception if the string is not valid HTML, e.g. has unmatched tags
    that need to be matched.
    """
    parser = html5lib.HTMLParser(strict=True)
    parser.parse(string)
