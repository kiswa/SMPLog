<?php
require_once 'vendor/autoload.php';

use RedBeanPHP\R;

class RssGenerator {
    private $serverLink;
    private $markdown;

    public function __construct() {
        $this->serverLink = $this->getServerLink();
        $this->markdown = new cebe\markdown\GithubMarkdown();
    }

    public function updateRss() {
        $blog = R::load('blog', 1);
        $posts = R::find('post', ' is_published = 1 ORDER BY publish_date DESC ');

        $xml = $this->getChannelXml($blog);

        $count = 1;
        foreach($posts as $post) {
            if ($count == 10) break;

            $xml .= $this->getItemXml($post);
            $count++;
        }

        $xml .= "\n\t</channel>" .
                "\n</rss>";

        file_put_contents('../rss/rss.xml', $xml);
    }

    private function getServerLink() {
        $protocol = isset($_SERVER['HTTPS']) &&
            !in_array(strtolower($_SERVER['HTTPS']), array('off', 'no'))
            ? 'https://' : 'http://';

        $serverLink = $protocol . $_SERVER['HTTP_HOST'] . explode('api', $_SERVER['REQUEST_URI'])[0];

        return $serverLink;
    }

    private function getChannelXml($blog) {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" .
               "\n<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">" .
               "\n\t<channel>" .
               "\n\t\t<atom:link href=\"$this->serverLink"."rss/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />" .
               "\n\t\t<title>$blog->name</title>" .
               "\n\t\t<link>$this->serverLink</link>" .
               "\n\t\t<description>$blog->desc</description>";
    }

    private function getItemXml($post) {
            $link = $this->serverLink . "posts/$post->slug";
            $text = explode(PHP_EOL, $post->text)[0];
            $html = $this->markdown->parse($text);

            return "\n\t\t<item>" .
                   "\n\t\t\t<title>$post->title</title>" .
                   "\n\t\t\t<link>$link</link>" .
                   "\n\t\t\t<guid>$link</guid>" .
                   "\n\t\t\t<pubDate>" . date('r', $post->publish_date) . "</pubDate>" .
                   "\n\t\t\t<description><![CDATA[" . trim($html) . "]]></description>" .
                   "\n\t\t</item>";
    }
}
