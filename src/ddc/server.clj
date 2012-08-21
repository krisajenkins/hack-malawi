(ns ddc.server
  (:require [noir.server :as server]
            [noir.response :as response])
  (:use [clojure.pprint :only [pprint]]))

(server/load-views "src/ddc/views/")

(defn -main [& m]
  (let [mode (keyword (or (first m) :dev))
        port (Integer. (get (System/getenv) "PORT" "8080"))]
    (server/start port {:mode mode :ns 'ddc})))
