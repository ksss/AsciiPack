require "asciipack/version"
begin
  require "asciipack/#{RUBY_VERSION[/\d+.\d+/]}/asciipack"
rescue LoadError
  require "asciipack/asciipack"
end
